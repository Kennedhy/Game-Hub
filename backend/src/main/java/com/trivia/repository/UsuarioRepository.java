package com.trivia.repository;

import com.trivia.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByNomeUsuario(String nomeUsuario);

    boolean existsByNomeUsuario(String nomeUsuario);

    @Query("SELECT u FROM Usuario u ORDER BY u.pontos DESC")
    List<Usuario> rankingCompleto();
}
