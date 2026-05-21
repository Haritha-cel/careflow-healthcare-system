import { ScrollView, StyleSheet, Text, View } from 'react-native' // ✅ Removed FlatList
import { useCallback, useState } from 'react'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { Calendar } from 'react-native-calendars'
import { COLORS } from '../styles/Color'
import SectionHeader from './SectionHeader'
import Chip from './Chip'

dayjs.extend(customParseFormat)

const generateTimeSlots = () => {
    const allSlots = Array.from({ length: 15 }, (_, i) => {
        const totalMinutes = 10 * 60 + i * 30;
        const hour = Math.floor(totalMinutes / 60);
        const minute = totalMinutes % 60;
        const period = hour >= 12 ? 'PM' : 'AM';
        const display12 = hour > 12 ? hour - 12 : hour;
        const minuteStr = minute === 0 ? '00' : '30'; 
        const hourStr = String(display12).padStart(2, '0');

        return {
            time: `${hourStr}:${minuteStr} ${period}`,
            value: `${hourStr}:${minuteStr} ${period}`
        };
    });

    return allSlots.filter(slot => slot.time !== '12:00 PM' && slot.time !== '12:30 PM');
};

const timeSlots = generateTimeSlots();

const reminderSlot = [
    { title: '15 min', value: '15' },
    { title: '30 min', value: '30' },
    { title: '45 min', value: '45' },
    { title: '1 hour', value: '60' }
];

const AppointmentSlot = ({ onChangeHandler, bookedSlots = {} }) => {
    const today = dayjs().format('YYYY-MM-DD');
    const maxDate = dayjs().add(14, 'day').format('YYYY-MM-DD');

    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedSlot, setSelectedSlot] = useState(null); 
    const [selectedRemindTime, setSelectedRemindTime] = useState(0);

    const isSlotPast = useCallback((slotValue) => {
        const isToday = selectedDate === today;
        if (!isToday) return false;
        const slotTime = dayjs(slotValue, 'hh:mm A');
        const now = dayjs();
        return slotTime.isBefore(now);
    }, [selectedDate, today]);

    const isSlotBooked = useCallback((slotValue) => {
        if (!bookedSlots || Object.keys(bookedSlots).length === 0) return false;
        const slotsForDate = bookedSlots[selectedDate]; 
        return slotsForDate ? slotsForDate.includes(slotValue) : false;
    }, [bookedSlots, selectedDate]);

    const onChangeDate = useCallback((day) => {
        setSelectedDate(day.dateString);
        setSelectedSlot(null); 
        onChangeHandler && onChangeHandler('date', day.dateString);
    }, [onChangeHandler]);

    const onChangeSlot = useCallback((index) => {
        const slot = timeSlots[index];
        if (isSlotPast(slot.value) || isSlotBooked(slot.value)) return;
        setSelectedSlot(index);
        onChangeHandler && onChangeHandler('time', slot.value);
    }, [onChangeHandler, isSlotPast, isSlotBooked]);

    const onChangeReminder = useCallback((index) => {
        setSelectedRemindTime(index);
        onChangeHandler && onChangeHandler('reminder', reminderSlot[index].value);
    }, [onChangeHandler]);

    return (
        <ScrollView 
            style={styles.container} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
        >
            <Calendar
                minDate={today}
                maxDate={maxDate}
                onDayPress={onChangeDate}
                markedDates={{
                    [selectedDate]: {
                        selected: true,
                        disableTouchEvent: true,
                        selectedDotColor: COLORS.PRIMARY
                    }
                }}
                theme={{
                    todayTextColor: selectedDate === today ? 'white' : COLORS.PRIMARY,
                    selectedDayBackgroundColor: COLORS.PRIMARY,
                    arrowColor: COLORS.PRIMARY
                }}
            />

            <SectionHeader title={'Available Time Slot'} />
            
            {/* ✅ THE FIX: A "Tray" container + horizontal ScrollView instead of FlatList */}
            <View style={styles.slotsTray}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.slotsScrollContent}
                >
                    {timeSlots.map((item, index) => {
                        const past = isSlotPast(item.value);
                        const booked = isSlotBooked(item.value); 
                        const disabled = past || booked;         
                        
                        // ✅ Tell the chip exactly WHY it's disabled
                        const status = past ? 'past' : booked ? 'booked' : null;

                        return (
                            <Chip
                                key={index}
                                onChange={onChangeSlot}
                                selected={selectedSlot}
                                name={item.time}
                                index={index}
                                disabled={disabled}
                                status={status}
                                // ✅ Add gap between horizontal chips
                                style={{ marginRight: 10 }} 
                            />
                        );
                    })}
                </ScrollView>
            </View>

            <Text style={styles.reminderTitle}>Remind Me Before</Text>
            
            <View style={styles.reminderContainer}>
                {reminderSlot.map((item, i) => (
                    <Chip
                        key={i}
                        onChange={onChangeReminder}
                        selected={selectedRemindTime}
                        name={item.title}
                        index={i}
                        // ✅ Make reminders look completely different from time slots
                        style={styles.reminderPill} 
                    />
                ))}
            </View>
        </ScrollView>
    );
};

export default AppointmentSlot;

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: 'white' 
    },
    
    // ✅ Visual "Tray" for Time Slots
    slotsTray: {
        backgroundColor: '#F8F8FD', // Very light purple background
        marginHorizontal: 20,
        borderRadius: 16,
        paddingVertical: 14,
        marginBottom: 10,
    },
    slotsScrollContent: {
        alignItems: 'center',
        paddingLeft: 14,   // Inner padding left
        paddingRight: 20,  // Prevents last chip from hugging the right edge
    },

    reminderTitle: { 
        fontWeight: '600', 
        fontSize: 16,
        color: '#333',
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 12,
    },
    reminderContainer: { 
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 10, // Modern gap property handles spacing perfectly
    },
    
    // ✅ Force Reminders into Pill Shapes
     reminderPill: {
        flex: 1,
        minWidth: '40%', 
        borderRadius: 50, 
        paddingVertical: 14, // Slightly taller
        alignItems: 'center',
        backgroundColor: '#FFFFFF',       // Pure white background
        borderColor: COLORS.PRIMARY + '40', // 25% opacity Primary border (creates a ghostly outline)
        borderWidth: 2,                    // Made border thicker so it's visible
    }
});