package com.medical.careflow.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Service
public class PushNotificationService {

    private static final Logger log = LoggerFactory.getLogger(PushNotificationService.class);
    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    public void sendPushNotification(String expoPushToken, String title, String body, Map<String, Object> data) {
        if (expoPushToken == null || expoPushToken.isEmpty()) return;

        try {
            Map<String, Object> payload = Map.of(
                    "to", expoPushToken,
                    "title", title,
                    "body", body,
                    "sound", "default",
                    "data", data != null ? data : Map.of(),
                    "channelId", "default"
            );

            String json = mapper.writeValueAsString(List.of(payload));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(EXPO_PUSH_URL))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = httpClient.send(request,
                    HttpResponse.BodyHandlers.ofString());

            log.info("Push notification sent: {}", response.body());

        } catch (Exception e) {
            log.error("Failed to send push notification: {}", e.getMessage());
        }
    }
}
