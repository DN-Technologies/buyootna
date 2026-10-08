import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatProposal, OfferPeriod, ProposalInput } from '@/shared/api/chat.service';
import { formatMessageTime } from '@/shared/utils/chatDate';
import { formatDayShort, OFFER_PERIOD_LABELS } from '@/shared/utils/chatProposals';
import { formatNumber } from '@/shared/utils/formatNumber';

interface ProposalSheetProps {
  kind: 'APPOINTMENT' | 'OFFER';
  // Answering this one: "موعد آخر" / "عرض مقابل"
  counterOf?: ChatProposal | null;
  // Rent ads default to a monthly offer
  defaultPeriod?: OfferPeriod;
  onClose: () => void;
  onSubmit: (input: ProposalInput) => void;
  // For tests: "now"
  now?: Date;
}

const DAYS_AHEAD = 60;
// Viewing times: 8:00 ص to 10:00 م, every 30 minutes
const FIRST_SLOT_MIN = 8 * 60;
const LAST_SLOT_MIN = 22 * 60;
const MIN_LEAD_MS = 30 * 60 * 1000;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Digits only (accepts Arabic-Indic digits too). */
export function parseAmount(text: string): number | null {
  const western = text
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[^\d.]/g, '');
  const value = Number(western);
  return western && Number.isFinite(value) && value > 0 ? value : null;
}

/** 📅 pick a day and a time, or 💰 an amount and period; an optional note. */
export default function ProposalSheet({
  kind,
  counterOf,
  defaultPeriod = 'TOTAL',
  onClose,
  onSubmit,
  now = new Date(),
}: ProposalSheetProps) {
  const insets = useSafeAreaInsets();
  const isAppointment = kind === 'APPOINTMENT';

  const days = useMemo(
    () =>
      Array.from({ length: DAYS_AHEAD }, (_, i) => {
        const d = startOfDay(now);
        d.setDate(d.getDate() + i);
        return d;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [day, setDay] = useState<Date>(days[0]);
  const [slot, setSlot] = useState<number | null>(null);
  const [amountText, setAmountText] = useState('');
  const [period, setPeriod] = useState<OfferPeriod>(counterOf?.period ?? defaultPeriod);
  const [note, setNote] = useState('');

  const slots = useMemo(() => {
    const list: { minutes: number; date: Date; disabled: boolean }[] = [];
    for (let m = FIRST_SLOT_MIN; m <= LAST_SLOT_MIN; m += 30) {
      const date = new Date(day);
      date.setMinutes(m);
      list.push({
        minutes: m,
        date,
        disabled: date.getTime() - now.getTime() < MIN_LEAD_MS,
      });
    }
    return list;
  }, [day, now]);

  const chosen = slots.find((s) => s.minutes === slot && !s.disabled);
  const amount = parseAmount(amountText);
  const canSend = isAppointment ? !!chosen : !!amount;

  const submit = () => {
    if (!canSend) return;
    onSubmit({
      ...(isAppointment
        ? { scheduledAt: chosen!.date.toISOString() }
        : { amount: amount!, period }),
      note: note.trim() || undefined,
      counterOfId: counterOf?.id,
    });
  };

  const title = counterOf
    ? isAppointment
      ? 'اقتراح موعد آخر'
      : 'عرض مقابل'
    : isAppointment
      ? 'موعد معاينة'
      : 'عرض سعر';

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-white"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity testID="proposal-sheet-close" onPress={onClose} className="p-1">
            <Feather name="x" size={22} color="#111111" />
          </TouchableOpacity>
          <Text className="font-cairo-bold text-base text-[#111111]">{title}</Text>
          <View className="w-8" />
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} keyboardShouldPersistTaps="handled">
          {isAppointment ? (
            <>
              <Text className="font-cairo-bold text-[14px] text-[#111111]" style={{ writingDirection: "rtl" }}>اليوم</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {days.map((d, i) => {
                  const active = d.getTime() === day.getTime();
                  return (
                    <TouchableOpacity
                      key={d.toISOString()}
                      testID={`proposal-day-${i}`}
                      onPress={() => {
                        setDay(d);
                        setSlot(null);
                      }}
                      className={`rounded-xl border px-3 py-2 ${active ? 'border-[#15304D] bg-[#15304D]' : 'border-gray-200'}`}
                    >
                      <Text className={`font-cairo-semibold text-[13px] ${active ? 'text-white' : 'text-[#111111]'}`}>
                        {i === 0 ? 'اليوم' : i === 1 ? 'غداً' : formatDayShort(d)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text className="font-cairo-bold text-[14px] text-[#111111]" style={{ writingDirection: "rtl" }}>الوقت</Text>
              <View className="flex-row flex-wrap gap-2">
                {slots.map((s) => {
                  const active = s.minutes === slot;
                  return (
                    <TouchableOpacity
                      key={s.minutes}
                      testID={`proposal-slot-${s.minutes}`}
                      disabled={s.disabled}
                      onPress={() => setSlot(s.minutes)}
                      className={`w-[23%] items-center rounded-lg border py-2 ${
                        active ? 'border-[#15304D] bg-[#15304D]' : s.disabled ? 'border-gray-100 bg-gray-50' : 'border-gray-200'
                      }`}
                    >
                      <Text
                        className={`font-cairo-medium text-[12px] ${
                          active ? 'text-white' : s.disabled ? 'text-gray-300' : 'text-[#111111]'
                        }`}
                      >
                        {formatMessageTime(s.date.toISOString())}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : (
            <>
              <Text className="font-cairo-bold text-[14px] text-[#111111]" style={{ writingDirection: "rtl" }}>المبلغ (د.ك)</Text>
              <TextInput
                testID="proposal-amount"
                value={amount ? formatNumber(amount) : amountText}
                onChangeText={setAmountText}
                keyboardType="numeric"
                placeholder="مثال: 250,000"
                placeholderTextColor="#979797"
                className="rounded-xl border border-gray-200 px-4 py-3 text-right font-cairo-bold text-[18px] text-[#111111]"
              />
              <View className="flex-row gap-2">
                {(Object.keys(OFFER_PERIOD_LABELS) as OfferPeriod[]).map((p) => (
                  <TouchableOpacity
                    key={p}
                    testID={`proposal-period-${p}`}
                    onPress={() => setPeriod(p)}
                    className={`flex-1 items-center rounded-xl border py-2 ${
                      period === p ? 'border-[#15304D] bg-[#15304D]' : 'border-gray-200'
                    }`}
                  >
                    <Text className={`font-cairo-semibold text-[13px] ${period === p ? 'text-white' : 'text-[#111111]'}`}>
                      {OFFER_PERIOD_LABELS[p]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <TextInput
            testID="proposal-note"
            value={note}
            onChangeText={setNote}
            placeholder="ملاحظة (اختياري)"
            placeholderTextColor="#979797"
            multiline
            maxLength={500}
            className="min-h-[70px] rounded-xl border border-gray-200 px-4 py-3 text-right font-cairo text-[14px] text-[#111111]"
          />
        </ScrollView>

        <View className="px-4 pt-2" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
          <TouchableOpacity
            testID="proposal-submit"
            disabled={!canSend}
            onPress={submit}
            className={`items-center rounded-xl py-3.5 ${canSend ? 'bg-[#15304D]' : 'bg-[#A0AEC0]'}`}
          >
            <Text className="font-cairo-bold text-[15px] text-white">إرسال</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
