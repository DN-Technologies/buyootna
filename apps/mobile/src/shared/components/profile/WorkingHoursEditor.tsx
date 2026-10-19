import { Feather } from '@expo/vector-icons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { showAlert } from '@/shared/utils/alert';
import {
  dateToTime,
  DAY_NAMES,
  DEFAULT_RANGE,
  defaultWeek,
  formatTime,
  MAX_RANGES_PER_DAY,
  timeToDate,
  weekProblem,
  type WorkingDay,
} from '@/shared/utils/workingHours';

interface WorkingHoursEditorProps {
  visible: boolean;
  // The saved week, or null to start from a default one
  value: WorkingDay[] | null;
  onClose: () => void;
  onSave: (week: WorkingDay[]) => void;
}

// Which time the picker is changing
interface Picking {
  day: number;
  index: number;
  field: 'from' | 'to';
}

/**
 * مواعيد العمل, like WhatsApp Business's business hours: each day of the
 * week open or closed, an open day with up to three time ranges, each end
 * set with the system time picker.
 */
export default function WorkingHoursEditor({
  visible,
  value,
  onClose,
  onSave,
}: WorkingHoursEditorProps) {
  const [week, setWeek] = useState<WorkingDay[]>(() => value ?? defaultWeek());
  const [picking, setPicking] = useState<Picking | null>(null);

  // Opening again starts from what is saved
  useEffect(() => {
    if (visible) {
      setWeek(value ?? defaultWeek());
      setPicking(null);
    }
  }, [visible, value]);

  const updateDay = (day: number, change: (d: WorkingDay) => WorkingDay) =>
    setWeek((current) =>
      current.map((item) => (item.day === day ? change(item) : item)),
    );

  const toggleDay = (day: number, open: boolean) =>
    updateDay(day, (d) => ({
      ...d,
      open,
      ranges: open && d.ranges.length === 0 ? [{ ...DEFAULT_RANGE }] : d.ranges,
    }));

  const addRange = (day: number) =>
    updateDay(day, (d) => {
      // The next range starts an hour after the last one ends
      const last = d.ranges[d.ranges.length - 1];
      const startHour = last ? Math.min(Number(last.to.slice(0, 2)) + 1, 22) : 9;
      const from = `${String(startHour).padStart(2, '0')}:00`;
      const to = `${String(Math.min(startHour + 2, 23)).padStart(2, '0')}:00`;
      return { ...d, ranges: [...d.ranges, { from, to }] };
    });

  const removeRange = (day: number, index: number) =>
    updateDay(day, (d) => ({
      ...d,
      ranges: d.ranges.filter((_, i) => i !== index),
    }));

  const setTime = (time: string) => {
    if (!picking) return;
    const { day, index, field } = picking;
    updateDay(day, (d) => ({
      ...d,
      ranges: d.ranges.map((r, i) => (i === index ? { ...r, [field]: time } : r)),
    }));
  };

  const onPickerChange = (event: DateTimePickerEvent, date?: Date) => {
    // Android's dialog closes itself; iOS keeps the spinner until «تم»
    if (Platform.OS === 'android') setPicking(null);
    if (event.type === 'set' && date) setTime(dateToTime(date));
  };

  const save = () => {
    const problem = weekProblem(week);
    if (problem) {
      showAlert('تنبيه', problem);
      return;
    }
    onSave(week);
  };

  const pickedValue = picking
    ? week.find((d) => d.day === picking.day)?.ranges[picking.index]?.[
        picking.field
      ]
    : undefined;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-[#ECECEC] px-5 py-4">
          <TouchableOpacity
            testID="working-hours-close"
            accessibilityRole="button"
            accessibilityLabel="إغلاق"
            onPress={onClose}
            hitSlop={10}
          >
            <Feather name="x" size={22} color="#111111" />
          </TouchableOpacity>
          <Text className="font-cairo-bold text-[16px] leading-[26px] text-[#111111]">
            مواعيد العمل
          </Text>
          <View className="w-[22px]" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
        >
          {week.map((day) => (
            <View
              key={day.day}
              testID={`working-day-${day.day}`}
              className="border-b border-[#F1F1F1] py-3"
            >
              {/* Day name and open / closed */}
              <View className="flex-row items-center justify-between">
                <Text
                  className="font-cairo-semibold text-[15px] leading-[24px] text-[#111111]"
                  style={{ writingDirection: 'rtl' }}
                >
                  {DAY_NAMES[day.day]}
                </Text>
                <View className="flex-row items-center gap-2">
                  <Text className="font-cairo text-[13px] leading-[22px] text-[#6B6A6A]">
                    {day.open ? 'مفتوح' : 'مغلق'}
                  </Text>
                  <Switch
                    testID={`working-day-${day.day}-open`}
                    value={day.open}
                    onValueChange={(open) => toggleDay(day.day, open)}
                    trackColor={{ false: '#6B6A6A', true: '#15304D' }}
                    ios_backgroundColor="#6B6A6A"
                    thumbColor="#FFFFFF"
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                  />
                </View>
              </View>

              {/* Its time ranges */}
              {day.open &&
                day.ranges.map((range, index) => (
                  <View
                    key={index}
                    className="mt-2 flex-row items-center gap-2"
                  >
                    {(['from', 'to'] as const).map((field) => (
                      <TouchableOpacity
                        key={field}
                        testID={`working-day-${day.day}-${index}-${field}`}
                        activeOpacity={0.7}
                        onPress={() => setPicking({ day: day.day, index, field })}
                        className={`h-[42px] flex-1 flex-row items-center justify-between rounded-[8px] border px-3 ${
                          picking?.day === day.day &&
                          picking.index === index &&
                          picking.field === field
                            ? 'border-[#15304D]'
                            : 'border-[#ECECEC]'
                        }`}
                      >
                        <Text className="font-cairo text-[12px] leading-[20px] text-[#6B6A6A]">
                          {field === 'from' ? 'من' : 'إلى'}
                        </Text>
                        <Text className="font-cairo-semibold text-[14px] leading-[22px] text-[#111111]">
                          {formatTime(range[field])}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    {day.ranges.length > 1 && (
                      <TouchableOpacity
                        testID={`working-day-${day.day}-${index}-remove`}
                        accessibilityRole="button"
                        accessibilityLabel="حذف الفترة"
                        onPress={() => removeRange(day.day, index)}
                        hitSlop={8}
                      >
                        <Feather name="trash-2" size={18} color="#D12121" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

              {day.open && day.ranges.length < MAX_RANGES_PER_DAY && (
                <TouchableOpacity
                  testID={`working-day-${day.day}-add`}
                  onPress={() => addRange(day.day)}
                  className="mt-2 flex-row items-center gap-1 self-start"
                >
                  <Feather name="plus" size={14} color="#15304D" />
                  <Text className="font-cairo-semibold text-[13px] leading-[22px] text-[#15304D]">
                    إضافة فترة
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>

        {/* The time being changed: Android shows its own dialog, iOS a
            spinner here with «تم» */}
        {picking && pickedValue && (
          <View
            className={
              Platform.OS === 'ios' ? 'border-t border-[#ECECEC] bg-white' : ''
            }
          >
            {Platform.OS === 'ios' && (
              <View className="flex-row justify-end px-5 pt-2">
                <TouchableOpacity
                  testID="working-hours-time-done"
                  onPress={() => setPicking(null)}
                >
                  <Text className="font-cairo-bold text-[15px] leading-[24px] text-[#15304D]">
                    تم
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <DateTimePicker
              testID="working-hours-time-picker"
              value={timeToDate(pickedValue)}
              mode="time"
              minuteInterval={15}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onPickerChange}
            />
          </View>
        )}

        <View className="px-5 pb-2 pt-3">
          <TouchableOpacity
            testID="working-hours-save"
            activeOpacity={0.8}
            onPress={save}
            className="h-12 w-full items-center justify-center rounded-full bg-[#15304D]"
          >
            <Text className="font-cairo-bold text-[15px] leading-[24px] text-white">
              حفظ
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
