package com.trivia.model;

import jakarta.persistence.*;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 16)
    private String nomeUsuario;

    @Column(nullable = false)
    private String senha;

    @Column(nullable = false)
    private Long pontos = 0L;

    @Column(nullable = false)
    private Integer partidasJogadas = 0;

    @Column(nullable = false)
    private Long criadoEm;

    @PrePersist
    protected void prePersist() {
        this.criadoEm = System.currentTimeMillis();
    }

    public Long getId() { return id; }
    public String getNomeUsuario() { return nomeUsuario; }
    public void setNomeUsuario(String nomeUsuario) { this.nomeUsuario = nomeUsuario; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public Long getPontos() { return pontos; }
    public void setPontos(Long pontos) { this.pontos = pontos; }
    public Integer getPartidasJogadas() { return partidasJogadas; }
    public void setPartidasJogadas(Integer partidasJogadas) { this.partidasJogadas = partidasJogadas; }
    public Long getCriadoEm() { return criadoEm; }
}
