import notifee, {
  AndroidImportance,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import { FocusSession, Task } from '../../types';

const TASK_CHANNEL_ID = 'flowday-tasks';
const FOCUS_CHANNEL_ID = 'flowday-focus';
const FOCUS_NOTIFICATION_ID = 'flowday-focus-active';

async function ensureChannel(channelId: string, name: string) {
  await notifee.createChannel({
    id: channelId,
    name,
    importance: AndroidImportance.HIGH,
  });
}

function reminderId(taskId: string) {
  return `task-reminder-${taskId}`;
}

function getTaskStartDate(task: Task) {
  if (
    typeof task.startHour !== 'number' ||
    typeof task.startMinute !== 'number' ||
    task.isAllDay
  ) {
    return null;
  }

  return new Date(`${task.date}T${String(task.startHour).padStart(2, '0')}:${String(
    task.startMinute,
  ).padStart(2, '0')}:00`);
}

export async function requestNotificationPermission() {
  await notifee.requestPermission();
  await ensureChannel(TASK_CHANNEL_ID, 'Task reminders');
  await ensureChannel(FOCUS_CHANNEL_ID, 'Focus mode');
}

export async function syncTaskReminders(tasks: Task[], enabled: boolean) {
  await ensureChannel(TASK_CHANNEL_ID, 'Task reminders');

  await Promise.all(
    tasks.map(task => notifee.cancelNotification(reminderId(task.id))),
  );

  if (!enabled) {
    return;
  }

  await Promise.all(
    tasks.map(async task => {
      if (!task.reminderMinutesBefore || task.completed || task.inInbox) {
        return;
      }

      const startDate = getTaskStartDate(task);
      if (!startDate) {
        return;
      }

      const triggerTimestamp = startDate.getTime() - task.reminderMinutesBefore * 60 * 1000;
      if (triggerTimestamp <= Date.now()) {
        return;
      }

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerTimestamp,
      };

      await notifee.createTriggerNotification(
        {
          id: reminderId(task.id),
          title: task.title,
          body: `Empieza en ${task.reminderMinutesBefore} min`,
          android: {
            channelId: TASK_CHANNEL_ID,
            pressAction: { id: 'default' },
          },
        },
        trigger,
      );
    }),
  );
}

export async function scheduleFocusNotification(session: FocusSession) {
  await ensureChannel(FOCUS_CHANNEL_ID, 'Focus mode');

  const startedAt = new Date(session.startedAt).getTime();
  const timestamp = startedAt + session.durationMinutes * 60 * 1000;
  if (timestamp <= Date.now()) {
    return;
  }

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp,
  };

  await notifee.createTriggerNotification(
    {
      id: FOCUS_NOTIFICATION_ID,
      title: 'Focus completado',
      body: `${session.taskTitle} terminó. Marca la tarea o replanifica.`,
      android: {
        channelId: FOCUS_CHANNEL_ID,
        pressAction: { id: 'default' },
      },
    },
    trigger,
  );
}

export async function cancelFocusNotification() {
  await notifee.cancelNotification(FOCUS_NOTIFICATION_ID);
}
