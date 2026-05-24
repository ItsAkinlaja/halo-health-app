import * as Notifications from 'expo-notifications';

// Configure notification behavior for foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Configure notification permission and setup daily reminders
 */
export async function scheduleDailyNotifications(profile) {
  try {
    // 1. Request/verify permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permission not granted for local notifications.');
      return false;
    }

    // 2. Clear previously scheduled notifications for clean start
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[Notifications] Cancelled all previously scheduled notifications.');

    if (!profile) {
      console.log('[Notifications] No active profile; skipping scheduling.');
      return false;
    }

    const name = profile.name || 'there';
    const isPet = profile.member_type === 'pet' || profile.relationship?.toLowerCase() === 'pet';
    const isBaby = profile.age_group === 'baby' || profile.age_group === 'child' || profile.relationship?.toLowerCase() === 'child';
    const hasAllergies = Array.isArray(profile.allergies) && profile.allergies.length > 0;

    // Default messages for standard human profile
    let morningMsg = {
      title: "Clean Morning Start ☀️",
      body: `Start your day with clean choices, ${name}! Scan your breakfast items to check their health score.`
    };
    
    let afternoonMsg = {
      title: "Scan Reminder 🛒",
      body: "Out shopping or grabbing a snack? Scan the barcode to avoid ultra-processed toxins."
    };
    
    let eveningMsg = {
      title: "Daily Health Recap 🏆",
      body: "How clean was your food today? Review your daily score and prepare for tomorrow!"
    };

    // Personalization based on profile type
    if (isPet) {
      const petType = profile.pet_type || 'pet';
      morningMsg = {
        title: `Morning Pet Check 🐾`,
        body: `Time for ${name}'s breakfast! Did you check if their food contains clean, safe ingredients?`
      };
      afternoonMsg = {
        title: `Snack Time for ${name} 🦴`,
        body: `Ready to reward your ${petType}? Scan their chew or treat to make sure it's free of toxic chemicals.`
      };
      eveningMsg = {
        title: `Pet Wellness Recap 🐕`,
        body: `Check ${name}'s dinner for toxic preservatives. Keep their digestion clean and healthy!`
      };
    } else if (isBaby) {
      morningMsg = {
        title: "Pure Baby Breakfast 🍼",
        body: `Scanning ${name}'s food? Make sure formulas and cereals have zero hidden additives.`
      };
      afternoonMsg = {
        title: "Safe Child Care Check 👶",
        body: `Snack time! Check if ${name}'s biscuits or wipes are clean-label verified.`
      };
      eveningMsg = {
        title: "Safe Bedtime Routine 💤",
        body: `Protect ${name}'s skin. Scan body washes, shampoos, and lotions before bedtime.`
      };
    } else if (hasAllergies) {
      const allergyList = profile.allergies.join(', ');
      morningMsg = {
        title: "Morning Allergen Shield 🛡️",
        body: `Double check breakfast! Verify that today's meals are safe from: ${allergyList}.`
      };
      afternoonMsg = {
        title: "Diet & Allergy Safe Snacks 🥕",
        body: `Grabbing a quick bite? Quick scan to identify allergen-free alternative choices.`
      };
      eveningMsg = {
        title: "Safe Dinner Goals 📊",
        body: `Let's hit a perfect clean health score for dinner today, free of your allergy triggers.`
      };
    }

    // Schedule 9:00 AM daily
    await Notifications.scheduleNotificationAsync({
      content: morningMsg,
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });

    // Schedule 1:30 PM daily
    await Notifications.scheduleNotificationAsync({
      content: afternoonMsg,
      trigger: {
        hour: 13,
        minute: 30,
        repeats: true,
      },
    });

    // Schedule 7:00 PM daily
    await Notifications.scheduleNotificationAsync({
      content: eveningMsg,
      trigger: {
        hour: 19,
        minute: 0,
        repeats: true,
      },
    });

    console.log(`[Notifications] Scheduled 3 daily local notifications for profile: ${name}`);
    return true;
  } catch (error) {
    console.error('[Notifications] Error scheduling daily notifications:', error);
    return false;
  }
}
