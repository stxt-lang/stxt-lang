/**
 * Generate -> validate -> fix.
 *
 * An LLM converts free text (source.txt) into an STXT document that must
 * validate against the template in .stxt/. The validator's errors go back to
 * the model, line by line, until the document validates or the attempts run out.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=... node generate.mjs [source.txt] [--max-attempts N]
 *
 * The document is printed on stdout; the conversation, on stderr. Exit code 0
 * when the final document validates, 1 otherwise.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { Parser, SchemaValidator, UnifiedSchemaProvider, ValidationException } from "@stxt-lang/core";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const maxAttempts = Number(args[args.indexOf("--max-attempts") + 1]) || 4;
const sourceFile = args.find((a) => !a.startsWith("--") && !/^\d+$/.test(a)) ?? path.join(here, "source.txt");

const template = fs.readFileSync(path.join(here, ".stxt", "com.acme.reports.stxt"), "utf8");
const example = fs.readFileSync(path.join(here, "example.stxt"), "utf8");
const source = fs.readFileSync(sourceFile, "utf8");

// --- Step 2 of the loop: validate. The same thing `stxt validate -` does. ---

const provider = new UnifiedSchemaProvider();
provider.addFile(template);

function validate(text) {
	const parser = new Parser();
	parser.registerValidator(new SchemaValidator(provider));
	const result = parser.parseResult(text);
	return result.getErrors().map((e) => {
		const kind = e instanceof ValidationException ? "schema" : "syntax";
		return `line ${e.line}: [${e.code}] ${e.message} (${kind})`;
	});
}

// --- Steps 1, 3 and 4: generate, report, repeat. ---

const client = new Anthropic();
const prompt = fs
	.readFileSync(path.join(here, "prompt.md"), "utf8")
	.replace("{{TEMPLATE}}", template.trimEnd())
	.replace("{{EXAMPLE}}", example.trimEnd())
	.replace("{{SOURCE}}", source.trimEnd());

const messages = [{ role: "user", content: prompt }];
let document = "";
let errors = [];

for (let attempt = 1; attempt <= maxAttempts; attempt++) {
	const response = await client.messages.create({
		model: "claude-opus-5",
		max_tokens: 16000,
		messages,
	});
	if (response.stop_reason === "refusal") {
		console.error("The model declined the request.");
		process.exit(1);
	}
	document = stripFences(response.content.filter((b) => b.type === "text").map((b) => b.text).join(""));
	errors = validate(document);

	console.error(`--- attempt ${attempt}: ${errors.length === 0 ? "valid" : `${errors.length} error(s)`}`);
	for (const e of errors) console.error("    " + e);
	if (errors.length === 0) break;

	// Send the document back exactly as validated, then the validator's output.
	messages.push({ role: "assistant", content: document });
	messages.push({
		role: "user",
		content:
			"The validator rejected the document with these errors (line numbers refer to your document):\n\n" +
			errors.join("\n") +
			"\n\nFix them and output the complete corrected document, and nothing else.",
	});
}

process.stdout.write(document.endsWith("\n") ? document : document + "\n");
process.exit(errors.length === 0 ? 0 : 1);

/** Models sometimes wrap the output in ``` despite being told not to. */
function stripFences(text) {
	const m = text.match(/^\s*```[^\n]*\n([\s\S]*?)\n```\s*$/);
	return (m ? m[1] : text).replace(/^﻿/, "");
}
