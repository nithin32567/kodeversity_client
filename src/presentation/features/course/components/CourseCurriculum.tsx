import type { Module as CourseModule } from "../types";
import { getChapterIcon, formatChapterDuration } from "./utils";

interface CourseCurriculumProps {
  modules: CourseModule[];
}

export function CourseCurriculum({ modules }: CourseCurriculumProps) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-semibold">Course Curriculum</h2>
      {modules && modules.length > 0 ? (
        <div className="space-y-4">
          {[...modules]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((mod) => (
              <div key={mod.id} className="rounded-xl border border-border bg-card/40 p-4">
                <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center justify-between">
                  <span>{mod.title}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {mod.chapters?.length ?? 0} Chapters
                  </span>
                </h3>
                {mod.chapters && mod.chapters.length > 0 ? (
                  <ul className="space-y-2">
                    {[...mod.chapters]
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((chap) => {
                        const IconComponent = getChapterIcon(chap.type);
                        return (
                          <li
                            key={chap.id}
                            className="flex items-center justify-between rounded-lg bg-card/60 p-3 text-sm hover:bg-foreground/[0.02]"
                          >
                            <div className="flex items-center gap-3">
                              <IconComponent className="h-4 w-4 text-primary shrink-0" />
                              <span className="text-foreground/90 font-medium">{chap.title}</span>
                              {chap.isPreview && (
                                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                                  Preview
                                </span>
                              )}
                            </div>
                            {chap.durationInSeconds || chap.duration ? (
                              <span className="text-xs text-muted-foreground">
                                {formatChapterDuration(chap.durationInSeconds || chap.duration)}
                              </span>
                            ) : null}
                          </li>
                        );
                      })}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">No chapters in this module.</p>
                )}
              </div>
            ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Curriculum details not available.</p>
      )}
    </div>
  );
}
