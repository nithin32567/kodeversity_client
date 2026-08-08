import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { Calendar as CalendarIcon, Clock, X, ChevronLeft, ChevronRight } from "lucide-react";

interface DateTimePickerModalProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  onClose: () => void;
}

function DateTimePickerModal({ value, onChange, onClose }: DateTimePickerModalProps) {
  const initialDate = value ? new Date(value) : new Date();
  
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(initialDate));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value ? initialDate : undefined);
  
  const [hours, setHours] = useState(value ? format(initialDate, "hh") : "12");
  const [minutes, setMinutes] = useState(value ? format(initialDate, "mm") : "00");
  const [ampm, setAmpm] = useState(value ? format(initialDate, "a") : "AM");

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const startDay = days[0].getDay();
  const paddingDays = Array.from({ length: startDay }).map((_, i) => i);

  const handleApply = () => {
    if (!selectedDate) return;
    
    let h = parseInt(hours, 10);
    if (ampm === "PM" && h < 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    
    const finalDate = new Date(selectedDate);
    finalDate.setHours(h, parseInt(minutes, 10), 0, 0);
    
    onChange(finalDate.toISOString());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-[320px] rounded-xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-3.5 bg-muted/30">
          <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-[var(--primary)]" /> Date & Time
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Calendar */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="font-semibold text-sm text-foreground">
                {format(currentMonth, "MMMM yyyy")}
              </div>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {paddingDays.map((_, i) => (
                <div key={`pad-${i}`} className="h-8 w-full" />
              ))}
              {days.map(day => {
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isTdy = isToday(day);
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`h-8 w-full rounded-md text-xs font-semibold transition-all duration-150 ${
                      isSelected 
                        ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20" 
                        : isTdy 
                          ? "bg-muted/60 text-[var(--primary)] border border-[var(--primary)]/30 hover:border-[var(--primary)]/60" 
                          : "hover:bg-muted/60 text-foreground"
                    }`}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Time Picker */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Time
            </label>
            <div className="flex gap-2">
              <select 
                value={hours} 
                onChange={e => setHours(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-muted/20 px-2 py-2 text-sm font-medium text-foreground outline-none focus:border-[var(--primary)]/60 transition-colors"
              >
                {Array.from({ length: 12 }).map((_, i) => {
                  const val = String(i === 0 ? 12 : i).padStart(2, '0');
                  return <option key={val} value={val}>{val}</option>;
                })}
              </select>
              <span className="flex items-center text-muted-foreground font-bold">:</span>
              <select 
                value={minutes} 
                onChange={e => setMinutes(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-muted/20 px-2 py-2 text-sm font-medium text-foreground outline-none focus:border-[var(--primary)]/60 transition-colors"
              >
                {Array.from({ length: 12 }).map((_, i) => {
                  const val = String(i * 5).padStart(2, '0');
                  return <option key={val} value={val}>{val}</option>;
                })}
              </select>
              <div className="flex rounded-lg border border-border overflow-hidden shadow-sm">
                <button 
                  onClick={() => setAmpm("AM")}
                  className={`px-3 py-1.5 text-xs font-bold transition-colors ${ampm === "AM" ? "bg-[var(--primary)] text-white" : "bg-muted/30 hover:bg-muted text-foreground"}`}
                >
                  AM
                </button>
                <button 
                  onClick={() => setAmpm("PM")}
                  className={`px-3 py-1.5 text-xs font-bold transition-colors ${ampm === "PM" ? "bg-[var(--primary)] text-white" : "bg-muted/30 hover:bg-muted text-foreground"}`}
                >
                  PM
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border p-3.5 bg-muted/30">
          <button 
            onClick={() => {
              onChange(undefined);
              onClose();
            }}
            className="px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
          >
            Clear
          </button>
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleApply}
              disabled={!selectedDate}
              className="rounded-lg bg-[var(--primary)] px-4 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm shadow-[var(--primary)]/20"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DateTimePickerProps {
  value: string | undefined;
  onChange: (val: string | undefined) => void;
  label: string;
}

export function DateTimePicker({ value, onChange, label }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const displayValue = value ? format(new Date(value), "MMM d, yyyy 'at' h:mm a") : "Not set";

  return (
    <>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm transition hover:border-[var(--primary)]/60 outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)]"
        >
          <span className={value ? "text-foreground font-medium" : "text-muted-foreground/60"}>
            {displayValue}
          </span>
          <CalendarIcon className={`h-4 w-4 ${value ? "text-[var(--primary)]" : "text-muted-foreground/60"}`} />
        </button>
      </div>

      {isOpen && (
        <DateTimePickerModal 
          value={value}
          onChange={onChange}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
