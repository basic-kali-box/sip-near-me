import React, { useState, useEffect } from 'react';
import { Clock, Copy, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BusinessHoursInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

interface DaySchedule {
  isOpen: boolean;
  startTime: string;
  endTime: string;
}

interface WeekSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

const DAYS = [
  { key: 'monday', label: 'Mon', fullName: 'Monday' },
  { key: 'tuesday', label: 'Tue', fullName: 'Tuesday' },
  { key: 'wednesday', label: 'Wed', fullName: 'Wednesday' },
  { key: 'thursday', label: 'Thu', fullName: 'Thursday' },
  { key: 'friday', label: 'Fri', fullName: 'Friday' },
  { key: 'saturday', label: 'Sat', fullName: 'Saturday' },
  { key: 'sunday', label: 'Sun', fullName: 'Sunday' },
] as const;

const TIME_OPTIONS = [
  '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM',
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM',
  '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM', '11:00 PM'
];

// Parse business hours string into schedule object
const parseBusinessHours = (hoursString: string): WeekSchedule => {
  const defaultSchedule: WeekSchedule = {
    monday: { isOpen: false, startTime: '9:00 AM', endTime: '5:00 PM' },
    tuesday: { isOpen: false, startTime: '9:00 AM', endTime: '5:00 PM' },
    wednesday: { isOpen: false, startTime: '9:00 AM', endTime: '5:00 PM' },
    thursday: { isOpen: false, startTime: '9:00 AM', endTime: '5:00 PM' },
    friday: { isOpen: false, startTime: '9:00 AM', endTime: '5:00 PM' },
    saturday: { isOpen: false, startTime: '9:00 AM', endTime: '5:00 PM' },
    sunday: { isOpen: false, startTime: '9:00 AM', endTime: '5:00 PM' },
  };

  if (!hoursString || hoursString.trim() === '') {
    return defaultSchedule;
  }

  try {
    // Simple parsing for common formats like "Mon-Fri: 9:00 AM - 5:00 PM, Sat-Sun: 10:00 AM - 4:00 PM"
    const parts = hoursString.split(',').map(part => part.trim());

    parts.forEach(part => {
      const [dayRange, timeRange] = part.split(':').map(s => s.trim());
      if (!dayRange || !timeRange) return;

      const [startTime, endTime] = timeRange.split('-').map(s => s.trim());
      if (!startTime || !endTime) return;

      // Parse day range
      let daysToUpdate: string[] = [];
      if (dayRange.includes('-')) {
        const [startDay, endDay] = dayRange.split('-').map(s => s.trim().toLowerCase());
        const dayMap = { mon: 'monday', tue: 'tuesday', wed: 'wednesday', thu: 'thursday', fri: 'friday', sat: 'saturday', sun: 'sunday' };
        const startIndex = DAYS.findIndex(d => d.key === dayMap[startDay as keyof typeof dayMap]);
        const endIndex = DAYS.findIndex(d => d.key === dayMap[endDay as keyof typeof dayMap]);

        if (startIndex !== -1 && endIndex !== -1) {
          for (let i = startIndex; i <= endIndex; i++) {
            daysToUpdate.push(DAYS[i].key);
          }
        }
      } else {
        // Single day or multiple days separated by spaces
        const dayMap = { mon: 'monday', tue: 'tuesday', wed: 'wednesday', thu: 'thursday', fri: 'friday', sat: 'saturday', sun: 'sunday' };
        const dayKey = dayMap[dayRange.toLowerCase() as keyof typeof dayMap];
        if (dayKey) {
          daysToUpdate.push(dayKey);
        }
      }

      // Update schedule for these days
      daysToUpdate.forEach(dayKey => {
        if (dayKey in defaultSchedule) {
          defaultSchedule[dayKey as keyof WeekSchedule] = {
            isOpen: true,
            startTime,
            endTime
          };
        }
      });
    });
  } catch (error) {
    console.warn('Failed to parse business hours:', error);
  }

  return defaultSchedule;
};

// Convert schedule object back to string
const formatBusinessHours = (schedule: WeekSchedule): string => {
  const dayGroups: { days: string[], startTime: string, endTime: string }[] = [];

  DAYS.forEach(({ key, label }) => {
    const daySchedule = schedule[key];
    if (!daySchedule.isOpen) return;

    // Find existing group with same time
    const existingGroup = dayGroups.find(group =>
      group.startTime === daySchedule.startTime &&
      group.endTime === daySchedule.endTime
    );

    if (existingGroup) {
      existingGroup.days.push(label);
    } else {
      dayGroups.push({
        days: [label],
        startTime: daySchedule.startTime,
        endTime: daySchedule.endTime
      });
    }
  });

  return dayGroups.map(group => {
    const dayRange = group.days.length > 1 &&
      group.days.length > 2 &&
      DAYS.findIndex(d => d.label === group.days[0]) + group.days.length - 1 === DAYS.findIndex(d => d.label === group.days[group.days.length - 1])
      ? `${group.days[0]}-${group.days[group.days.length - 1]}`
      : group.days.join(', ');

    return `${dayRange}: ${group.startTime} - ${group.endTime}`;
  }).join(', ');
};

export const BusinessHoursInput: React.FC<BusinessHoursInputProps> = ({
  value,
  onChange,
  error,
  className = ''
}) => {
  const [schedule, setSchedule] = useState<WeekSchedule>(() => parseBusinessHours(value));

  useEffect(() => {
    const newValue = formatBusinessHours(schedule);
    if (newValue !== value) {
      onChange(newValue);
    }
  }, [schedule, onChange]);

  const updateDaySchedule = (dayKey: keyof WeekSchedule, updates: Partial<DaySchedule>) => {
    setSchedule(prev => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], ...updates }
    }));
  };

  const copyFromDay = (fromDay: keyof WeekSchedule, toDay: keyof WeekSchedule) => {
    const fromSchedule = schedule[fromDay];
    updateDaySchedule(toDay, {
      startTime: fromSchedule.startTime,
      endTime: fromSchedule.endTime
    });
  };

  const copyToAll = (fromDay: keyof WeekSchedule) => {
    const fromSchedule = schedule[fromDay];
    const updates: Partial<WeekSchedule> = {};

    DAYS.forEach(({ key }) => {
      if (key !== fromDay) {
        updates[key] = {
          ...schedule[key],
          startTime: fromSchedule.startTime,
          endTime: fromSchedule.endTime
        };
      }
    });

    setSchedule(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label className="text-sm font-medium text-gray-700">Business Hours *</Label>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        {DAYS.map(({ key, label, fullName }) => {
          const daySchedule = schedule[key];
          return (
            <div key={key} className="flex items-center gap-4 py-2">
              {/* Day Label */}
              <div className="w-12 text-sm font-medium text-gray-700">
                {label}
              </div>

              {/* Open/Closed Checkbox */}
              <div className="flex items-center gap-2 min-w-[80px]">
                <Checkbox
                  checked={daySchedule.isOpen}
                  onCheckedChange={(checked) => {
                    updateDaySchedule(key, { isOpen: !!checked });
                  }}
                  className="data-[state=checked]:bg-matcha-600 data-[state=checked]:border-matcha-600"
                />
                <span className="text-sm text-gray-600">
                  {daySchedule.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>

              {/* Time Selectors */}
              {daySchedule.isOpen && (
                <>
                  <Select
                    value={daySchedule.startTime}
                    onValueChange={(value) => updateDaySchedule(key, { startTime: value })}
                  >
                    <SelectTrigger className="w-32 h-9 text-sm border-gray-300 focus:border-matcha-500 focus:ring-matcha-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map(time => (
                        <SelectItem key={time} value={time} className="text-sm">
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <span className="text-sm text-gray-500">to</span>

                  <Select
                    value={daySchedule.endTime}
                    onValueChange={(value) => updateDaySchedule(key, { endTime: value })}
                  >
                    <SelectTrigger className="w-32 h-9 text-sm border-gray-300 focus:border-matcha-500 focus:ring-matcha-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map(time => (
                        <SelectItem key={time} value={time} className="text-sm">
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Copy Actions */}
                  <div className="flex gap-1 ml-auto">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToAll(key)}
                      className="w-8 h-8 p-0 text-gray-400 hover:text-matcha-600 hover:bg-matcha-50"
                      title="Copy to all days"
                    >
                      <Clipboard className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Copy to next day (if exists)
                        const currentIndex = DAYS.findIndex(d => d.key === key);
                        if (currentIndex < DAYS.length - 1) {
                          copyFromDay(key, DAYS[currentIndex + 1].key);
                        }
                      }}
                      className="w-8 h-8 p-0 text-gray-400 hover:text-matcha-600 hover:bg-matcha-50"
                      title="Copy to next day"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}

              {/* Closed state placeholder */}
              {!daySchedule.isOpen && (
                <div className="flex-1 text-sm text-gray-400 italic">
                  Closed
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* Current Schedule Preview */}
      {value && (
        <div className="p-3 bg-matcha-50 border border-matcha-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-matcha-600" />
            <span className="text-sm font-medium text-matcha-800">Your Schedule:</span>
          </div>
          <p className="text-sm text-matcha-700">{value}</p>
        </div>
      )}

      <div className="text-xs text-gray-500">
        <p><strong>Tips:</strong> Use the checkboxes to set which days you're open, then select your hours. Use the copy buttons to quickly apply the same hours to multiple days.</p>
      </div>
    </div>
  );
};


