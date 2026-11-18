# Learning reminder delivery

The backend process starts a worker after MongoDB connects. It checks for due reminders every minute, claims work using MongoDB leases, and sends email through Brevo. Run at least one continuously available backend instance with `MONGO_URL`, `BREVO_API_KEY`, and `EMAIL_FROM` configured. Serverless instances or instances that sleep do not provide timely delivery while stopped. The UI reports whether email credentials are configured, but this is not a health check of Brevo or worker uptime.

New reminders use the browser's IANA time zone. Older reminders have no time zone and are inactive until the student activates them from the learning tools screen. Weekly reminders repeat on the weekday on which they are created or activated. Once reminders run at the next occurrence of the chosen local time. If a local time is skipped during a daylight-saving transition, the next matching day is used. Failed deliveries are retried after 15 minutes; missed recurring occurrences are not replayed individually.

The worker uses a five-minute lease. Delivery is at least once: a process that crashes after Brevo accepts an email but before MongoDB records success can cause a duplicate. Keep MongoDB indexes enabled, including the unique course/user/legacy-note index, for safe concurrent note imports.

Old browser notes are not associated with an account. The Notes tab asks the signed-in student to import the notes found on that device. The browser copy is removed only after the server confirms the same note was stored; invalid, conflicting, and inaccessible notes stay in the browser. Other browsers and devices must be visited separately.
