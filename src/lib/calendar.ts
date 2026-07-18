export async function addEventToGoogleCalendar(
  event: {
    title: string;
    theme: string;
    description: string;
    date: string;
  },
  accessToken: string
): Promise<string | null> {
  try {
    const startDateTime = `${event.date}T09:00:00`;
    const endDateTime = `${event.date}T18:00:00`;

    // Get user timezone (default to local timezone)
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';

    const body = {
      summary: `${event.title} (${event.theme})`,
      description: event.description || `Evento temático bimestral da comunidade: ${event.title}`,
      start: {
        dateTime: startDateTime,
        timeZone: timeZone,
      },
      end: {
        dateTime: endDateTime,
        timeZone: timeZone,
      },
      reminders: {
        useDefault: true,
      },
    };

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Calendar API error response:', errorText);
      throw new Error(`Google Calendar API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id || null;
  } catch (error) {
    console.error('Error adding event to Google Calendar:', error);
    throw error;
  }
}

export async function deleteEventFromGoogleCalendar(
  calendarEventId: string,
  accessToken: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${calendarEventId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 204 || response.ok) {
      return true;
    } else {
      const errorText = await response.text();
      console.error('Google Calendar delete error:', errorText);
      return false;
    }
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
    return false;
  }
}
