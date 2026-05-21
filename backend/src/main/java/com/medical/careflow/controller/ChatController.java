package com.medical.careflow.controller;

import com.medical.careflow.exception.BadRequestException;
import com.medical.careflow.model.Appointment;
import com.medical.careflow.model.ChatMessage;
import com.medical.careflow.repository.AppointmentsRepository;
import com.medical.careflow.repository.ChatMessageRepository;
import com.medical.careflow.util.InputSanitizer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin
public class ChatController {

    @Autowired private ChatMessageRepository chatMessageRepository;
    @Autowired private AppointmentsRepository appointmentsRepository;
    @Autowired private MongoTemplate mongoTemplate;

    private void verifyAccessToRoom(String currentUserId, String roomId) {
        if (roomId == null || !roomId.startsWith("appt_")) {
            throw new BadRequestException("Invalid room ID format");
        }

        String appointmentId = InputSanitizer.sanitizePlain(roomId.replace("appt_", ""));
        Appointment appt = appointmentsRepository.findById(appointmentId)
                .orElseThrow(() -> new BadRequestException("Appointment not found"));

        if (!currentUserId.equals(appt.getUserId()) && !currentUserId.equals(appt.getDoctorId())) {
            throw new AccessDeniedException("Forbidden: No access to this room");
        }
    }

    @PostMapping("/message")
    public ResponseEntity<?> saveMessage(
            @RequestAttribute(value = "userId", required = false) String userId,
            @RequestAttribute(value = "doctorId", required = false) String doctorId,
            @RequestBody ChatMessage message) {

        String sender = (doctorId != null) ? doctorId : userId;
        if (sender == null) throw new AccessDeniedException("Unauthorized");

        // ✅ sanitize = plain text, no HTML, 2000 char limit — correct for chat messages
        String sanitizedText   = InputSanitizer.sanitize(message.getText());
        String sanitizedRoomId = InputSanitizer.sanitizePlain(message.getRoomId());

        if (sanitizedText == null || sanitizedText.isBlank() ||
                sanitizedRoomId == null || sanitizedRoomId.isBlank()) {
            throw new BadRequestException("Missing required fields");
        }

        verifyAccessToRoom(sender, sanitizedRoomId);

        ChatMessage msg = ChatMessage.builder()
                .id(UUID.randomUUID().toString())
                .roomId(sanitizedRoomId)
                .from(sender)
                .text(sanitizedText)
                .timestamp(LocalDateTime.now())
                .readBy(new ArrayList<>(List.of(sender)))
                .clearedBy(new ArrayList<>())
                .build();

        ChatMessage saved = chatMessageRepository.save(msg);

        Map<String, Object> response = new HashMap<>();
        response.put("id",        saved.getId());
        response.put("roomId",    saved.getRoomId());
        response.put("from",      saved.getFrom());
        response.put("text",      saved.getText());
        response.put("timestamp", saved.getTimestamp().toString());
        response.put("readBy",    saved.getReadBy());
        response.put("clearedBy", saved.getClearedBy());

        return ResponseEntity.ok(Map.of("success", true, "message", response));
    }

    @GetMapping("/history/{roomId}")
    public ResponseEntity<?> getHistory(
            @RequestAttribute(value = "userId", required = false) String userId,
            @RequestAttribute(value = "doctorId", required = false) String doctorId,
            @PathVariable String roomId) {

        String currentUserId = (doctorId != null) ? doctorId : userId;
        if (currentUserId == null) throw new AccessDeniedException("Unauthorized");

        String sanitizedRoomId = InputSanitizer.sanitizePlain(roomId);
        verifyAccessToRoom(currentUserId, sanitizedRoomId);

        List<ChatMessage> messages = chatMessageRepository.findVisibleMessages(sanitizedRoomId, currentUserId);

        List<Map<String, Object>> response = messages.stream().map(m -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id",        m.getId());
            map.put("roomId",    m.getRoomId());
            map.put("from",      m.getFrom());
            map.put("text",      m.getText());
            map.put("timestamp", m.getTimestamp().toString());
            map.put("readBy",    m.getReadBy());
            map.put("clearedBy", m.getClearedBy());
            return map;
        }).toList();

        return ResponseEntity.ok(Map.of("success", true, "messages", response));
    }

    @PutMapping("/mark-read")
    public ResponseEntity<?> markRead(
            @RequestAttribute(value = "userId", required = false) String userId,
            @RequestAttribute(value = "doctorId", required = false) String doctorId,
            @RequestBody Map<String, String> request) {

        String currentUserId = (doctorId != null) ? doctorId : userId;
        String roomId = request.get("roomId");
        if (currentUserId == null || roomId == null) throw new BadRequestException("Missing required fields");

        String sanitizedRoomId = InputSanitizer.sanitizePlain(roomId);
        verifyAccessToRoom(currentUserId, sanitizedRoomId);

        Query query = new Query(Criteria.where("roomId").is(sanitizedRoomId)
                .and("readBy").ne(currentUserId));
        Update update = new Update().addToSet("readBy", currentUserId);
        mongoTemplate.updateMulti(query, update, ChatMessage.class);

        return ResponseEntity.ok(Map.of("success", true, "message", "Marked as read"));
    }

    @PutMapping("/clear")
    public ResponseEntity<?> clearChat(
            @RequestAttribute(value = "userId", required = false) String userId,
            @RequestAttribute(value = "doctorId", required = false) String doctorId,
            @RequestBody Map<String, String> request) {

        String currentUserId = (doctorId != null) ? doctorId : userId;
        String roomId = request.get("roomId");
        if (currentUserId == null || roomId == null) throw new BadRequestException("Missing required fields");

        String sanitizedRoomId = InputSanitizer.sanitizePlain(roomId);
        verifyAccessToRoom(currentUserId, sanitizedRoomId);

        Query query = new Query(Criteria.where("roomId").is(sanitizedRoomId)
                .and("clearedBy").ne(currentUserId));
        Update update = new Update().addToSet("clearedBy", currentUserId);
        mongoTemplate.updateMulti(query, update, ChatMessage.class);

        return ResponseEntity.ok(Map.of("success", true, "message", "Chat cleared"));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(
            @RequestAttribute(value = "userId", required = false) String userId,
            @RequestAttribute(value = "doctorId", required = false) String doctorId) {

        String currentUserId = (doctorId != null) ? doctorId : userId;
        if (currentUserId == null) throw new AccessDeniedException("Unauthorized");

        List<Appointment> userAppointments =
                appointmentsRepository.findByUserIdOrDoctorId(currentUserId, currentUserId);

        Map<String, Integer> unreadByRoom = new HashMap<>();
        for (Appointment appt : userAppointments) {
            String roomId = "appt_" + appt.getId();
            long count = chatMessageRepository.countUnreadMessages(roomId, currentUserId);
            if (count > 0) unreadByRoom.put(roomId, (int) count);
        }

        return ResponseEntity.ok(Map.of("success", true, "unreadCounts", unreadByRoom));
    }
}