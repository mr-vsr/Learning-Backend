const getPublicId = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 1].replace(/\..*$/, "");
}

export { getPublicId };