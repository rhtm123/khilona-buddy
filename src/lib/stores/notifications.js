import { writable } from 'svelte/store';

export const notifications = writable([]);

export function addNotification(notification) {
    notifications.update(n => {
        // Keep only last 5 notifications
        const newNotifications = [notification, ...n].slice(0, 5);
        return newNotifications;
    });
}