package com.medical.careflow.util;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Set;

public class FileValidationUtil {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5MB

    // ✅ REMOVED 'throws IOException' from method signature
    public static void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("File too large. Max 5MB allowed.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException(
                    "Invalid file type. Only JPEG, PNG, WebP allowed."
            );
        }

        byte[] bytes;
        try {
            bytes = file.getBytes(); // ✅ Catch IOException internally
        } catch (IOException e) {
            // If we can't read the file, treat it as a bad request
            throw new IllegalArgumentException("Could not read file contents");
        }

        if (bytes.length < 4) {
            throw new IllegalArgumentException("Invalid image file");
        }

        // Check magic bytes (file signature)
        String hex = String.format("%02X%02X%02X%02X",
                bytes[0], bytes[1], bytes[2], bytes[3]);

        boolean validSignature = hex.startsWith("FFD8")      // JPEG
                || hex.startsWith("89504E47")                 // PNG
                || hex.startsWith("52494646");                // WebP (RIFF)

        if (!validSignature) {
            throw new IllegalArgumentException(
                    "File content does not match an allowed image format."
            );
        }
    }
}