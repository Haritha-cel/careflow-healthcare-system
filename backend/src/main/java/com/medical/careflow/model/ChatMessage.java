package com.medical.careflow.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "chat_messages")
@CompoundIndex(name = "roomId_timestamp_idx", def = "{'roomId': 1, 'timestamp': 1}")
public class ChatMessage {

    @Id
    private String id;

    @Indexed
    private String roomId;

    private String from;

    private String text;

    private LocalDateTime timestamp;

    @Builder.Default
    private List<String> readBy = new ArrayList<>();

    @Builder.Default
    private List<String> clearedBy = new ArrayList<>();
}
