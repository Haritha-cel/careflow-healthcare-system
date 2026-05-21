package com.medical.careflow.repository;

import com.medical.careflow.model.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {

    // Get all messages for a room, sorted by time
    List<ChatMessage> findByRoomIdOrderByTimestampAsc(String roomId);

    // ✅ REFINED: Get messages NOT cleared by a specific user
    // Checks if the user's ID is NOT present in the clearedBy array
    @Query("{'roomId': ?0, 'clearedBy': { $nin: [?1] }}")
    List<ChatMessage> findVisibleMessages(String roomId, String userId);

    // ✅ REFINED: Performance-optimized count for unread messages
    // Message must be in the room, NOT sent by the user, NOT read by the user, NOT cleared by the user
    @Query(value = "{'roomId': ?0, 'from': { $ne: ?1 }, 'readBy': { $nin: [?1] }, 'clearedBy': { $nin: [?1] }}", count = true)
    long countUnreadMessages(String roomId, String userId);
}