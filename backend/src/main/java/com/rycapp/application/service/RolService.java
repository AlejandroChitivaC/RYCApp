package com.rycapp.application.service;

import com.rycapp.application.ports.in.RolUseCase;
import com.rycapp.application.ports.out.RolRepository;
import com.rycapp.domain.model.Rol;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RolService implements RolUseCase {
    private final RolRepository rolRepository;

    public RolService(RolRepository rolRepository) {
        this.rolRepository = rolRepository;
    }

    @Override
    public List<Rol> listar() {
        return rolRepository.findAll();
    }
}
