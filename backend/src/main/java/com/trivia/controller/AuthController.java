package com.trivia.controller;

import com.trivia.model.Usuario;
import com.trivia.repository.UsuarioRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository repo;

    public AuthController(UsuarioRepository repo) {
        this.repo = repo;
    }

    @PostMapping("/cadastrar")
    public ResponseEntity<?> cadastrar(@RequestBody Map<String, String> body, HttpSession session) {
        String nome  = body.getOrDefault("nomeUsuario", "").trim().toUpperCase();
        String senha = body.getOrDefault("senha", "").trim();

        if (nome.isEmpty() || senha.isEmpty())
            return erro("Preencha todos os campos.");
        if (nome.length() < 3 || nome.length() > 16)
            return erro("Nome deve ter entre 3 e 16 caracteres.");
        if (!nome.matches("[A-Z0-9_]+"))
            return erro("Use apenas letras, números e _.");
        if (senha.length() < 4)
            return erro("Senha deve ter ao menos 4 caracteres.");
        if (repo.existsByNomeUsuario(nome))
            return erro("Usuário já existe.");

        Usuario u = new Usuario();
        u.setNomeUsuario(nome);
        u.setSenha(senha);
        repo.save(u);

        session.setAttribute("nomeUsuario", u.getNomeUsuario());
        return ok(perfil(u));
    }

    @PostMapping("/entrar")
    public ResponseEntity<?> entrar(@RequestBody Map<String, String> body, HttpSession session) {
        String nome  = body.getOrDefault("nomeUsuario", "").trim().toUpperCase();
        String senha = body.getOrDefault("senha", "").trim();

        if (nome.isEmpty() || senha.isEmpty())
            return erro("Preencha todos os campos.");

        Optional<Usuario> opt = repo.findByNomeUsuario(nome);
        if (opt.isEmpty())
            return erro("Usuário não encontrado.");
        if (!opt.get().getSenha().equals(senha))
            return erro("Senha incorreta.");

        session.setAttribute("nomeUsuario", opt.get().getNomeUsuario());
        return ok(perfil(opt.get()));
    }

    @PostMapping("/sair")
    public ResponseEntity<?> sair(HttpSession session) {
        session.invalidate();
        return ok(Map.of("mensagem", "Sessão encerrada."));
    }

    @GetMapping("/sessao")
    public ResponseEntity<?> sessao(HttpSession session) {
        String nome = (String) session.getAttribute("nomeUsuario");
        if (nome == null)
            return ResponseEntity.status(401).body(Map.of("erro", "Não autenticado."));

        return repo.findByNomeUsuario(nome)
                .map(u -> ok(perfil(u)))
                .orElse(ResponseEntity.status(401).body(Map.of("erro", "Usuário não encontrado.")));
    }

    private Map<String, Object> perfil(Usuario u) {
        return Map.of(
                "nomeUsuario",     u.getNomeUsuario(),
                "pontos",          u.getPontos(),
                "partidasJogadas", u.getPartidasJogadas()
        );
    }

    private ResponseEntity<Map<String, Object>> ok(Map<String, Object> data) {
        return ResponseEntity.ok(data);
    }

    @SuppressWarnings("unchecked")
    private <T> ResponseEntity<T> erro(String msg) {
        return (ResponseEntity<T>) ResponseEntity.badRequest().body(Map.of("erro", msg));
    }
}
