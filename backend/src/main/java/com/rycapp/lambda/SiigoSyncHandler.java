package com.rycapp.lambda;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.ScheduledEvent;
import com.rycapp.RycAppBackendApplication;
import com.rycapp.application.ports.in.SiigoFacturaSyncUseCase;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

public class SiigoSyncHandler implements RequestHandler<ScheduledEvent, String> {
    private static final ConfigurableApplicationContext CTX = SpringApplication.run(
            RycAppBackendApplication.class,
            "--spring.main.web-application-type=none"
    );

    @Override
    public String handleRequest(ScheduledEvent event, Context context) {
        var result = CTX.getBean(SiigoFacturaSyncUseCase.class).sincronizar();
        return result.message();
    }
}
