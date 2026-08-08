/**
 * DateTimePickerModal.tsx
 * Custom cyberpunk-themed date and time picker modal.
 */
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, Check, X } from "lucide-react";

interface DateTimePickerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (dateString: string) => void;
  initialDate?: string;
  title?: string;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DateTimePickerModal({
  open,
  onClose,
  onConfirm,
  initialDate,
  title = "Select Date & Time",
}: DateTimePickerModalProps) {
  const [visible, setVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    return initialDate ? new Date(initialDate) : new Date();
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    return initialDate ? new Date(initialDate) : null;
  });

  const [hours, setHours] = useState(() => {
    if (!initialDate) return "12";
    const d = new Date(initialDate);
    return String(d.getHours()).padStart(2, "0");
  });

  const [minutes, setMinutes] = useState(() => {
    if (!initialDate) return "00";
    const d = new Date(initialDate);
    return String(d.getMinutes()).padStart(2, "0");
  });

  useEffect(() => {
    if (open) {
      if (initialDate) {
        const d = new Date(initialDate);
        setCurrentMonth(new Date(d));
        setSelectedDate(new Date(d));
        setHours(String(d.getHours()).padStart(2, "0"));
        setMinutes(String(d.getMinutes()).padStart(2, "0"));
      }
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open, initialDate]);

  if (!open) return null;

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const handleConfirm = () => {
    if (!selectedDate) {
      handleClose();
      return;
    }
    const result = new Date(selectedDate);
    result.setHours(parseInt(hours, 10));
    result.setMinutes(parseInt(minutes, 10));
    
    // Format to YYYY-MM-DDThh:mm
    const yyyy = result.getFullYear();
    const MM = String(result.getMonth() + 1).padStart(2, "0");
    const dd = String(result.getDate()).padStart(2, "0");
    const hh = String(result.getHours()).padStart(2, "0");
    const mm = String(result.getMinutes()).padStart(2, "0");
    
    onConfirm(`${yyyy}-${MM}-${dd}T${hh}:${mm}`);
    handleClose();
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
  };

  const handleTimeChange = (type: "hours" | "minutes", val: string) => {
    let num = parseInt(val, 10);
    if (isNaN(num)) num = 0;
    
    if (type === "hours") {
      num = Math.max(0, Math.min(23, num));
      setHours(String(num).padStart(2, "0"));
    } else {
      num = Math.max(0, Math.min(59, num));
      setMinutes(String(num).padStart(2, "0"));
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <div
        className={`relative w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl transition-all duration-200 ${
          visible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        <div className="h-1 rounded-t-2xl" style={{ background: "var(--gradient-primary)" }} />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-[var(--primary)]" />
              {title}
            </h2>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Month Selector */}
          <div className="flex items-center justify-between mb-4 px-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg border border-border hover:bg-muted/30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-foreground">
              {currentMonth.toLocaleString("en-US", { month: "long", year: "numeric" })}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg border border-border hover:bg-muted/30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 mb-5">
            {DAYS.map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-1"
              >
                {d}
              </div>
            ))}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected =
                selectedDate?.getDate() === day &&
                selectedDate?.getMonth() === currentMonth.getMonth() &&
                selectedDate?.getFullYear() === currentMonth.getFullYear();

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`h-8 w-full rounded-md text-xs font-medium transition-all duration-150 ${
                    isSelected
                      ? "bg-[var(--primary)] text-white shadow-[0_0_15px_-3px_var(--primary)] scale-105"
                      : "text-foreground bg-muted/10 border border-transparent hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Time Selector */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Clock className="h-4 w-4" /> Time
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={0}
                max={23}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                onBlur={(e) => handleTimeChange("hours", e.target.value)}
                className="w-12 text-center rounded-lg border border-border bg-card px-2 py-1.5 text-sm font-bold text-foreground outline-none focus:border-[var(--primary)]/50 transition-colors"
              />
              <span className="font-bold text-muted-foreground">:</span>
              <input
                type="number"
                min={0}
                max={59}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                onBlur={(e) => handleTimeChange("minutes", e.target.value)}
                className="w-12 text-center rounded-lg border border-border bg-card px-2 py-1.5 text-sm font-bold text-foreground outline-none focus:border-[var(--primary)]/50 transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={handleConfirm}
            disabled={!selectedDate}
            className="w-full mt-5 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 active:scale-[0.98]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Check className="h-4 w-4" />
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
}
