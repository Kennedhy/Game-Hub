package com.trivia.controller;

import com.trivia.model.Usuario;
import com.trivia.repository.UsuarioRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/pontos")
public class PontosController {

    private final UsuarioRepository repo;

    public PontosController(UsuarioRepository repo) {
        this.repo = repo;
    }

    @PostMapping("/salvar")
    public ResponseEntity<?> salvar(@RequestBody Map<String, Object> body, HttpSession session) {
        String nome = (String) session.getAttribute("nomeUsuario");
        if (nome == null)
            return ResponseEntity.status(401).body(Map.of("erro", "Não autenticado."));

        long pontos = Long.parseLong(body.getOrDefault("pontos", "0").toString());

        Optional<Usuario> opt = repo.findByNomeUsuario(nome);
        if (opt.isEmpty())
            return ResponseEntity.status(404).body(Map.of("erro", "Usuário não encontrado."));

        Usuario u = opt.get();
        u.setPontos(u.getPontos() + pontos);
        u.setPartidasJogadas(u.getPartidasJogadas() + 1);
        repo.save(u);

        return ResponseEntity.ok(Map.of(
                "pontosTotais",    u.getPontos(),
                "partidasJogadas", u.getPartidasJogadas()
        ));
    }

    @GetMapping("/ranking")
    public ResponseEntity<?> ranking() {
        List<Usuario> todos = repo.rankingCompleto();

        List<Map<String, Object>> lista = new ArrayList<>();
        for (int i = 0; i < todos.size(); i++) {
            Usuario u = todos.get(i);
            lista.add(Map.of(
                    "posicao",         i + 1,
                    "nomeUsuario",     u.getNomeUsuario(),
                    "pontos",          u.getPontos(),
                    "partidasJogadas", u.getPartidasJogadas()
            ));
        }

        return ResponseEntity.ok(lista);
    }
}
