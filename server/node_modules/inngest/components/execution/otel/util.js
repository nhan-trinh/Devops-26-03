import { InngestSpanProcessor } from "./processor.js";
import { context, trace } from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { AsyncHooksContextManager } from "@opentelemetry/context-async-hooks";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { BasicTracerProvider } from "@opentelemetry/sdk-trace-base";
import { AnthropicInstrumentation } from "@traceloop/instrumentation-anthropic";

//#region src/components/execution/otel/util.ts
const createProvider = (_behaviour, instrumentations = []) => {
	const processor = new InngestSpanProcessor();
	const p = new BasicTracerProvider({ spanProcessors: [processor] });
	registerInstrumentations({ instrumentations: [
		...instrumentations,
		...getNodeAutoInstrumentations(),
		new AnthropicInstrumentation()
	] });
	trace.setGlobalTracerProvider(p);
	context.setGlobalContextManager(new AsyncHooksContextManager().enable());
	return {
		success: true,
		processor
	};
};
/**
* Attempts to extend the existing OTel provider with our processor. Returns true
* if the provider was extended, false if it was not.
*/
const extendProvider = (behaviour) => {
	const globalProvider = trace.getTracerProvider();
	if (!globalProvider) {
		if (behaviour !== "auto") console.warn("No existing OTel provider found and behaviour is \"extendProvider\". Inngest's OTel middleware will not work. Either allow the middleware to create a provider by setting `behaviour: \"createProvider\"` or `behaviour: \"auto\"`, or make sure that the provider is created and imported before the middleware is used.");
		return { success: false };
	}
	const existingProvider = "getDelegate" in globalProvider && typeof globalProvider.getDelegate === "function" ? globalProvider.getDelegate() : globalProvider;
	if (!existingProvider || !("addSpanProcessor" in existingProvider) || typeof existingProvider.addSpanProcessor !== "function") {
		if (behaviour !== "auto") console.warn("Existing OTel provider is not a BasicTracerProvider. Inngest's OTel middleware will not work, as it can only extend an existing processor if it's a BasicTracerProvider.");
		return { success: false };
	}
	const processor = new InngestSpanProcessor();
	existingProvider.addSpanProcessor(processor);
	return {
		success: true,
		processor
	};
};

//#endregion
export { createProvider, extendProvider };
//# sourceMappingURL=util.js.map