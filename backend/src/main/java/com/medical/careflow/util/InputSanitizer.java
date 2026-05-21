package com.medical.careflow.util;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

public class InputSanitizer {

    private static final Safelist BASIC_SAFE =
            Safelist.none()
                    .addTags("b", "strong", "i", "em", "p", "br");

    // ✅ Plain text — strips ALL HTML, 500 char limit.
    // Use for: names, emails, IDs, addresses, short single-line fields.
    public static String sanitizePlain(String input) {
        if (input == null) return null;
        String cleaned = Jsoup.clean(input, Safelist.none()).trim();
        return cleaned.length() > 500 ? cleaned.substring(0, 500) : cleaned;
    }

    // ✅ Chat / medium-length text — strips all HTML, higher 2000 char limit.
    // Use for: chat messages, short user-generated text that must be plain.
    // Named "sanitize" so existing calls in ChatController compile without changes.
    public static String sanitize(String input) {
        if (input == null) return null;
        String cleaned = Jsoup.clean(input, Safelist.none()).trim();
        return cleaned.length() > 2000 ? cleaned.substring(0, 2000) : cleaned;
    }

    // ✅ Rich text — allows safe formatting tags, 5000 char limit.
    // Use for: doctor "about" field, descriptions, anything that may contain basic formatting.
    public static String sanitizeRichText(String input) {
        if (input == null) return null;
        String cleaned = Jsoup.clean(input, BASIC_SAFE).trim();
        return cleaned.length() > 5000 ? cleaned.substring(0, 5000) : cleaned;
    }
}