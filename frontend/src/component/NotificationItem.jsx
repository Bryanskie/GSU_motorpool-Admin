function NotificationItem({ message, timestamp }) {
  const formattedTime = new Date(timestamp).toLocaleString();

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-300">
      <div>
        <p className="font-semibold text-gray-700">{message}</p>
        <p className="text-xs text-gray-500">{formattedTime}</p>
      </div>
    </div>
  );
}

export default NotificationItem;
