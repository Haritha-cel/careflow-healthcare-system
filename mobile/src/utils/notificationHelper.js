import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';

// ── 1. REQUEST PERMISSION ────────────────────────────────────
export async function requestNotificationPermission() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        Alert.alert('Permission Required', 'Please enable notifications in Settings.');
        return false;
    }
    return true;
}

// ── 2. CONFIGURE + GET PUSH TOKEN ───────────────────────────
export async function configureNotifications() {
    await requestNotificationPermission();

    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            enableVibrate: true,
        });
    }
}

// ── 3. GET EXPO PUSH TOKEN ───────────────────────────────────
export async function getExpoPushToken() {
    // Push tokens only work on real devices
    if (!Device.isDevice) {
        console.log('⚠️ Push tokens require a real device');
        return null;
    }

    try {
        const granted = await requestNotificationPermission();
        if (!granted) return null;

        const token = await Notifications.getExpoPushTokenAsync({
            projectId: process.env.EXPO_PUBLIC_PROJECT_ID, // from app.json > extra > eas > projectId
        });

        console.log('✅ Expo Push Token:', token.data);
        return token.data; // looks like: ExponentPushToken[xxxxxx]
    } catch (err) {
        console.error('❌ Failed to get push token:', err);
        return null;
    }
}

// ── 4. SCHEDULE LOCAL REMINDER (unchanged) ───────────────────
export async function scheduleAppointmentReminder(appointment) {
    const { slotDate, slotTime, reminderMinutes, id } = appointment;
    if (!reminderMinutes || reminderMinutes === 0) return;

    try {
        const timeParts = slotTime.split(' ');
        const [hours, minutes] = timeParts[0].split(':');
        const ampm = timeParts[1].toLowerCase();

        let hour = parseInt(hours);
        if (ampm === 'pm' && hour !== 12) hour += 12;
        if (ampm === 'am' && hour === 12) hour = 0;

        const [year, month, day] = slotDate.split('-').map(Number);
        const appointmentDate = new Date();
        appointmentDate.setFullYear(year, month - 1, day);
        appointmentDate.setHours(hour, parseInt(minutes), 0, 0);

        const triggerTime = new Date(appointmentDate.getTime() - reminderMinutes * 60 * 1000);

        if (triggerTime < new Date()) {
            console.log('⚠️ Reminder time is in the past, skipping.');
            return;
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Upcoming Appointment ⏰",
                body: `Your appointment is in ${reminderMinutes} minutes.`,
                data: { appointmentId: id },
                sound: 'default',
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                channelId: 'default',
                date: triggerTime,
            },
        });

        console.log(`✅ Scheduled reminder for ${triggerTime}`);
    } catch (error) {
        console.error('❌ Error scheduling notification:', error);
    }
}