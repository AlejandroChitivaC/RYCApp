package com.rycapp.interfaces.rest.dto.siigo;

import java.util.List;

public record SiigoConsultaResponse(
        boolean ok,
        boolean configured,
        String message,
        String baseUrl,
        String partnerId,
        String username,
        int documentTypesCount,
        List<DocumentTypeItem> documentTypes,
        int usersTotal,
        List<UserItem> usersSample
) {
    public record DocumentTypeItem(long id, String code, String name, String prefix, boolean active) {}

    public record UserItem(long id, String username, String email, boolean active) {}
}
