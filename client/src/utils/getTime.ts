export const padZero = (n: number) => {
    return n > 9 ? n : "0" + n;
};

export const getTime = (Date: Date, mode: "common" | "dark"): string => {
    const dt = Date;
    const hh = padZero(dt.getHours());
    switch (mode) {
        case "dark": {
            return String(hh);
        }
        case "common": {
            const y = dt.getFullYear();
            const m = padZero(dt.getMonth() + 1);
            const d = padZero(dt.getDate());
            const mm = padZero(dt.getMinutes());
            const ss = padZero(dt.getSeconds());
            return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
        }
    }
};




