import { Reveal } from "@/components/section";

export interface ProcessStep {
  title: string;
  copy: string;
}

export function ProcessSteps({ steps }: { steps: ProcessStep[] }) {
  return (
    <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, i) => (
        <Reveal
          as="li"
          key={step.title}
          delay={i * 90}
          className="relative min-w-0 border-t-2 border-accent/70 pt-5"
        >
          <span className="font-serif text-4xl text-accent/80">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-2 text-xl">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.copy}</p>
        </Reveal>
      ))}
    </ol>
  );
}
