function generateUniqueId() {
    return 'id-' + Math.random().toString(36).substr(2, 16);
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

export { generateUniqueId, formatTimestamp };