"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatShortDate } from "@/lib/dates";
import { ANSWER_ORIGIN_LABEL, DIFFICULTY_META, toParagraphs } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DailyInterviewQuestion } from "@/types/content";
import { SectionCard, type SectionDates, usePreviousDayToggle } from "./section-card";

interface InterviewQuestionSectionProps {
  dates: SectionDates;
  current: DailyInterviewQuestion | null;
  previous: DailyInterviewQuestion | null;
}

export function InterviewQuestionSection({ dates, current, previous }: InterviewQuestionSectionProps) {
  const { showingPrevious, shownDate, toggle } = usePreviousDayToggle(dates);
  const question = showingPrevious ? previous : current;

  return (
    <SectionCard
      section="interview"
      dates={dates}
      showingPrevious={showingPrevious}
      onToggle={toggle}
      updatedAt={question?.updatedAt ?? null}
      isDemo={question?.isDemo ?? false}
    >
      {question ? (
        <QuestionBody key={shownDate} question={question} />
      ) : (
        <EmptyState
          description={`No interview question was published for ${formatShortDate(shownDate)}.`}
        />
      )}
    </SectionCard>
  );
}

function QuestionBody({ question }: { question: DailyInterviewQuestion }) {
  const [open, setOpen] = useState(false);
  const difficulty = question.difficulty ? DIFFICULTY_META[question.difficulty] : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{question.topic}</Badge>
        {difficulty && (
          <Badge variant="outline" className={difficulty.className}>
            {difficulty.label}
          </Badge>
        )}
      </div>

      <p className="font-heading text-xl leading-snug font-medium text-pretty">{question.question}</p>

      <Collapsible open={open} onOpenChange={setOpen} className="flex flex-col gap-3">
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="h-10 w-full justify-between sm:h-9 sm:w-fit sm:gap-3">
            {open ? "Hide answer" : "Show answer"}
            <ChevronDown
              className={cn("transition-transform duration-200", open && "rotate-180")}
              aria-hidden
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-3 rounded-lg bg-muted/40 p-4">
          {toParagraphs(question.answer).map((paragraph, index) => (
            <p key={index} className="text-base leading-relaxed text-foreground/90">
              {paragraph}
            </p>
          ))}
          <p className="text-sm text-muted-foreground">{ANSWER_ORIGIN_LABEL[question.answerOrigin]}</p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
