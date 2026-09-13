SOLUÇÕES & DESTINOS — v8 (moderação de recados pelo navegador via Supabase)
====================================================================
Atualizado em 10/09/2026

====================================================================
NOVIDADES DA v4 (11/09/2026) — Painel ao Vivo + ícones novos
====================================================================

1) ÍCONES NOVOS E MAIS LEVES
   Os blocos marrons e pesados dos cartões (fundo marrom grande) foram
   substituídos por ícones em traço fino (linha) sobre fundo creme
   clarinho, com detalhes em âmbar. Mesma identidade visual, porém mais
   leve, moderno e discreto. Vale para os 9 cartões da home e para os
   4 ícones da página de cada destino (idioma, moeda, época, chegada).

2) RELÓGIOS MUNDIAIS (estilo painel de aeroporto)
   Bloco "Hora Certa no Mundo" com 5 relógios digitais grandes,
   atualizados a cada segundo (hora exata, data e diferença para
   Brasília). Padrão: São Paulo, Nova York, Londres, Paris e Tóquio.
   A engrenagem (⚙) permite trocar por mais de 50 cidades do mundo
   (inclui Tel Aviv, Roma, Lisboa, Dubai, Bariloche...). A escolha fica
   salva no navegador: ao voltar, os mesmos 5 relógios aparecem.

3) CÂMBIO EM REAIS COM GRÁFICO (estilo bolsa de valores)
   Bloco com as 3 moedas principais — Dólar, Euro e Franco Suíço —
   mostrando o valor em reais, a variação dos últimos 30 dias e um
   gráfico (linha + área). Clicando no cartão abre o gráfico grande com
   30, 60 ou 90 dias e estatísticas (mínima, máxima, média e variação).
   - ⚙  = escolher quais são as 3 moedas principais (fica salvo)
   - 🌐 Todas as moedas = lista completa com busca por nome e botões
     1/2/3 para fixar qualquer moeda no painel principal.
   Fontes: exchangerate-api.com (cotações) e Banco Central Europeu
   (histórico dos gráficos). Tudo automático, sem editar código.

4) RADAR MUNDIAL — notícias em tempo real
   Abas com as notícias mais recentes de Israel, Estados Unidos, Rússia,
   China, Europa, Oriente Médio, ONU/Mundo e Brasil (Google Notícias em
   português, com o GDELT como plano B). Aparece na home e na página
   Notícias & Vistos. Atualiza sozinho e tem botão "Atualizar".

ARQUIVO NOVO
------------
- widgets.js → Arquivo que faz os 3 blocos acima funcionarem.
  IMPORTANTE: publique ele junto com os HTMLs, senão os painéis ficam
  em branco. Faça o upload da pasta COMPLETA (HTMLs + widgets.js +
  fotos/ + sua-imagem.jpg).

OBSERVAÇÕES
-----------
- Os relógios usam o fuso do próprio navegador (sem depender de site
  externo) — por isso nunca falham e sempre mostram a hora exata.
- As cotações vêm de fontes públicas gratuitas. Se alguma falhar, o
  site avisa em vez de quebrar, e o resto continua funcionando.
- As escolhas de cidades e moedas ficam salvas por navegador/dispositivo
  (cada visitante personaliza o seu, sem alterar o site para os outros).

====================================================================
NOVIDADES DA v5 (11/09/2026) — bandeiras + mural de recados
====================================================================

1) BANDEIRAS DE VERDADE EM TUDO QUANTO É LUGAR
   Agora os países aparecem com a bandeira real (imagem), de forma
   bonita e discreta, para o visitante ir se acostumando com os
   lugares:
   - Relógios: bandeira grande em cima e uma marca d'água bem suave
     no fundo de cada cartão
   - Câmbio: bandeira ao lado de cada moeda (Dólar 🇺🇸, Euro 🇪🇺,
     Franco Suíço 🇨🇭...) e marca d'água no cartão
   - Notícias: bandeira do país em cada aba, no cabeçalho do país
     selecionado e em cada manchete
   - Destinos: selo com a bandeira no canto da foto de cada destino
   - Recados: quem comenta pode escolher a própria bandeira (49 países)
   As bandeiras vêm de um serviço público de imagens (flagcdn).
   Se a internet falhar, o site usa o emoji da bandeira no lugar.

2) MURAL DE RECADOS DA COMUNIDADE (comentários no site)
   Nova seção "💬 Recados da Comunidade" no fim da home:
   - Visitante escreve NOME + RECADO e pode escolher sua BANDEIRA
   - NÃO pedimos e-mail, telefone nem nenhum contato
   - O recado aparece na hora para a pessoa e é enviado para moderação
   - Depois de aprovado, ele fica no site para TODOS lerem

   COMO PUBLICAR OS RECADOS APROVADOS (moderação):
   a) Os recados chegam no painel da Netlify (Forms → "comunidade").
   b) Abra o arquivo comentarios.json (que vai na pasta do site) e
      cole cada recado aprovado dentro da lista "comentarios",
      seguindo o modelo que está no próprio arquivo.
      Exemplo de um recado:
        {
          "nome": "Ana",
          "pais": "Portugal",
          "iso": "pt",
          "texto": "Amei Matera, vale ir fora de temporada!",
          "data": "2026-09-11T15:00:00"
        }
      (separe cada bloco por vírgula)
   c) Suba o site de novo. Pronto: o recado aparece no mural.
   Dica: também é só me mandar os textos aprovados que eu coloco no
   arquivo e gero o ZIP atualizado para você.

====================================================================
CORRECAO URGENTE (v5.1 — 11/09/2026)
====================================================================
Problema: os relogios, as noticias e o campo de recados sumiram.
Causa: um erro meu no codigo (uma variavel escrita sem declaracao),
que fazia o navegador abortar o script inteiro. Ja corrigido.

O que mudou para nunca mais acontecer:
1) O codigo dos paineis (relogios, cambio, noticias e recados) foi
   INCORPORADO DENTRO das paginas index.html e noticias.html.
   Ou seja: o site voltou a nao depender de arquivo separado.
   Se voce publicar somente os arquivos HTML, ja funciona.
2) Cada bloco agora e independente: se um der problema, os outros
   continuam de pe (e em vez de sumir, aparece um aviso para
   recarregar a pagina).

ARQUIVOS (o essencial)
----------------------
- index.html        → tudo incluido (painel ao vivo + mural)
- noticias.html     → tudo incluido (radar mundial)
- destino.html      → pagina de cada destino
- servicos.html     → Wise, Nomad, hoteis e marcenaria
- comentarios.json  → recados aprovados que aparecem no mural
- sua-imagem.jpg    → banner do topo
- fotos/            → 30 fotos (nao apague!)
- widgets.js        → OPCIONAL: ficou apenas como copia de seguranca.
                      O site NAO precisa mais dele.

COMO PUBLICAR
-------------
Arraste para a Netlify a pasta inteira (ou pelo menos os 4 HTMLs +
comentarios.json + sua-imagem.jpg + a pasta fotos/).
Depois de publicar, abra o site e aperte CTRL+F5 (ou F5) para o
navegador esquecer a versao antiga guardada.

====================================================================
COMO DEIXAR OS RECADOS VISÍVEIS NO SITE (moderação)
====================================================================
Os recados que as pessoas escrevem chegam no painel da Netlify
(Forms → "comunidade"). Para valer para todos os visitantes, eles
precisam entrar no arquivo comentarios.json. Duas formas:

FORMA FÁCIL (recomendada)
  Me mande aqui os recados aprovados (só nome e texto, e o país se
  quiser a bandeirinha) que eu coloco no arquivo e te devolvo o ZIP
  prontinho para publicar.

FORMA AUTÔNOMA (sem depender de ninguém)
  1) Abra o arquivo moderar.html (vai na pasta do site) no navegador.
  2) Digite a palavra-chave: solucoes
  3) Cole os recados, um por linha, assim:
        Nome | País | Texto do recado
     Exemplo:
        Ana | Portugal | Amei Matera, vale ir fora de temporada!
  4) Confira a prévia e clique em "Gerar arquivo".
  5) Clique em "Baixar comentarios.json".
  6) Troque esse arquivo pelo comentarios.json da pasta do site.
  7) Publique a pasta de novo na Netlify. Pronto!

  Dica: para não perder os recados que já estão no ar, cole o conteúdo
  do comentarios.json atual no campo "manter os recados" da página.
  A página roda inteira no seu computador: nada é enviado para fora.

====================================================================
REGRA DO MURAL (v5.2)
====================================================================
- Aparecem os 5 recados APROVADOS mais recentes, do mais novo para o
  mais antigo. Quando chega o 6º, o mais antigo sai da TELA (mas nao
  e apagado do arquivo).
- Quem quiser ler o historico completo clica no botao
  "Ver todos os X recados" que aparece embaixo do mural.
- O recado que a propria pessoa acabou de escrever (ainda nao aprovado)
  continua aparecendo para ela, mesmo fora dos 5, com o selo
  "aguardando moderacao (so voce ve)". Assim ninguem escreve e acha
  que sumiu.

====================================================================
NOVIDADES DA v6 (12/09/2026) — banco de 31 destinos com rodízio
====================================================================

1) O SITE AGORA TEM UM BANCO DE 31 DESTINOS
   Além das 10 joias discretas de antes, entram 21 destinos novos:
   - Europa/Espaço Schengen (9): Sintra, Bruges, Hallstatt, Bled,
     Annecy, Rothenburg, Bergen, Tallinn e Zagreb
   - Mais badalados — maioria da Europa (9): Paris, Roma, Londres,
     Barcelona, Amsterdã, Veneza, Lisboa, Praga e Santorini
   - Mais badalados — fora da Europa (3): Nova York, Tóquio e Dubai
   Todos com página completa (documentos, idioma, moeda, melhor
   época, como chegar, 5 imperdíveis, culinária, mapa, dicas e
   galeria de fotos que se renova sozinha).

2) RODÍZIO DIÁRIO AUTOMÁTICO (sem você mexer em nada)
   Todo dia, à meia-noite, o site monta sozinho a seleção de 10:
       3 joias discretas + 3 Europa/Espaço Schengen + 4 badalados
   Funciona igual às notícias e ao câmbio: é automático, não precisa
   editar código nem publicar de novo. Os destinos vão girando dentro
   de cada grupo, então em poucos dias o visitante vê combinações
   diferentes.
   Novo botão "🌍 Ver todos do banco" mostra os 31 de uma vez, e os
   filtros por continente continuam funcionando.

====================================================================
NOVIDADES DA v7 (12/09/2026) — ajustes de layout + rodapé completo
====================================================================
1) Bandeira do destino mudou de lugar: antes ficava em cima do texto
   "1/10 • Europa" no cartão; agora aparece no canto superior
   DIREITO da foto, sem esconder nada.
2) Removido o aviso explicativo do rodízio (o sistema continua
   funcionando, só não fica avisando na tela — fica mais limpo).
3) Removida a marca d'água dos relógios. A bandeirinha continua
   aparecendo em cima de cada relógio, do jeito que você pediu.
4) RODAPÉ NOVO em todas as páginas, com 4 colunas:
   - Quem Somos (texto sobre o site)
   - Navegue (Início, Destinos, Notícias, Serviços, Marcenaria,
     Recados da Comunidade)
   - Dicas úteis (ETIAS, passaporte, clima, preparação, emergências
     no exterior e vacina)
   - Institucional (Quem Somos, Ajuda, Privacidade, Termos,
     Aviso de Afiliados e Contato)
   As redes sociais ficam no rodapé e há a linha de direitos.
5) PÁGINA NOVA: institucional.html
   Reúne os textos que davam credibilidade ao site:
   👋 Quem Somos · ❓ Ajuda & Dúvidas (FAQ) · 🔒 Privacidade ·
   📄 Termos de Uso · 🤝 Aviso de Afiliados · ✉️ Contato
   (inclui o aviso de que Wise, Nomad e plataformas de hospedagem
   são links de afiliado — transparência que todo site precisa ter).

====================================================================
NOVIDADES DA v8 — MODERAÇÃO PELO NAVEGADOR (SUPABASE)
====================================================================
Agora você aprova os recados com 1 CLIQUE, pelo navegador, sem
gerar arquivo e sem publicar o site de novo.

COMO FUNCIONA
-------------
1) O visitante escreve no mural → o recado vai direto para o banco
   (Supabase) com o status "pendente".
2) Você abre o moderar.html, entra com seu login de moderador e vê
   a lista: ✅ Aprovar · ↩️ Voltar para pendente · 🗑️ Excluir.
3) Ao aprovar, o recado aparece no site NA HORA, para todo mundo.
Os recados pendentes NUNCA aparecem para os visitantes.

O QUE VOCÊ PRECISA FAZER (só uma vez)
-------------------------------------
A) CRIAR O PROJETO (se ainda não criou)
   Painel do Supabase → New project → dê um nome → Create project
   (demora ~2 minutos).

B) CRIAR A TABELA
   SQL Editor → New query → cole TODO o conteúdo do arquivo
   supabase-tabela.sql → RUN.
   Isso cria a tabela "recados" e as regras de segurança.

C) CRIAR O LOGIN DO MODERADOR
   Authentication → Users → Add user → Create new user
   Coloque seu e-mail e uma senha e MARQUE "Auto Confirm User".

D) PEGAR AS 2 CHAVES
   Project Settings (ícone de engrenagem) → API
   - Project URL  → algo como https://abcdefgh.supabase.co
   - Project API keys → anon / public  (a chave LONGA, pública)

E) COLAR NO SITE
   Abra o arquivo supabase-config.js e troque as duas linhas:
       window.SUPABASE_URL = "https://SEU-PROJETO.supabase.co";
       window.SUPABASE_ANON_KEY = "COLE_A_CHAVE_ANON_AQUI";
   Salve e publique o site uma última vez.

F) USAR
   Abra o seu site + /moderar.html  →  entre com o e-mail e a senha
   que você criou no passo C.

SEGURANÇA
---------
- A chave "anon" é pública por design; quem protege são as regras
  do banco (RLS) criadas no passo B.
- NUNCA coloque a chave "service_role" no site.
- O painel de moderação exige login; a sessão vale por 1 hora.

PLANO B (se o banco falhar)
---------------------------
O site continua funcionando: se não conseguir falar com o banco,
o mural volta a ler o arquivo comentarios.json. Por isso vale a
pena usar o botão "💾 Backup JSON" do painel de vez em quando.

====================================================================
NOVIDADES DA v9 (12/09/2026) — ÍCONES OFICIAIS + NOVAS PLATAFORMAS
====================================================================
1) REDES SOCIAIS: os ícones agora são os LOGOS OFICIAIS do
   Instagram, TikTok, YouTube, Facebook e Pinterest (novo!).
   O Pinterest entrou na barra de redes e no rodapé.
2) LOGOS OFICIAIS nos serviços: Wise, Nomad, Booking (agora na cor
   azul da marca), Airbnb, Expedia, Hotels.com e TripAdvisor (novo,
   8ª opção de hospedagem). Skyscanner, Hostelworld e Decolar
   receberam ícones novos no mesmo padrão.
3) NOVA SEÇÃO "Passeios, Ingressos & Transporte" em Serviços:
   - Omio (trens e ônibus) com o código de convite MARCED4H2Z9L
   - espaço reservado para passeios/Experiências e para museus/
     parques (aguardando seus links de indicação)
4) ÍCONES NOVOS nas seções: ETIAS (documento com chip), EES
   (biometria), ETA (autorização), clima, passaporte, emergências,
   vacina, hotéis & pousadas, dicas úteis e marcenaria (serra,
   martelo, esquadro, óculos, lixa, grampo, pincel).
5) NOVA SEÇÃO ETA em Notícias & Vistos: explica a autorização
   eletrônica do Reino Unido (obrigatória para brasileiros),
   do Canadá (só com visto americano ou visto canadense recente)
   e o alerta sobre o ESTA dos EUA (brasileiros não são elegíveis).
   Tudo com links oficiais dos governos.
6) MURAL: o contador agora diz "mostrando os 5 recados mais
   recentes publicados" e o botão virou "Ver todos os comentários".
   Quando não há recados, a frase antiga ("0 de 0") não aparece.

COMO DEIXAR A MODERAÇÃO SEM LOGIN (opcional)
--------------------------------------------
Se criar usuário no Supabase estiver difícil, rode o arquivo
supabase-moderacao-simples.sql no painel (SQL Editor → New query →
Run). Depois tire as três barras (//) da última linha do arquivo
supabase-config.js. Pronto: o moderar.html abre direto, sem senha.

ARQUIVOS
--------
- index.html        → home (painel ao vivo + mural de recados)
- destino.html      → páginas dos 31 destinos
- noticias.html     → notícias & vistos + radar mundial
- servicos.html     → Wise, Nomad, hotéis e marcenaria
- institucional.html→ Quem Somos, Ajuda, Privacidade, Termos, Contato
- moderar.html      → painel do moderador (login do Supabase)
- comentarios.json  → recados aprovados que aparecem no mural
- sua-imagem.jpg    → banner do topo
- fotos/            → 51 fotos (não apague!)
- widgets.js        → opcional, só cópia de segurança

ARQUIVOS
--------
- index.html        → home (painel ao vivo + mural de recados) - tudo incorporado
- noticias.html     → notícias (radar mundial) - tudo incorporado
- destino.html      → página de cada destino
- servicos.html     → Wise, Nomad, hotéis e marcenaria
- moderar.html      → área do moderador (não aparece no menu do site)
- comentarios.json  → recados aprovados que aparecem no mural
- sua-imagem.jpg    → banner do topo
- fotos/            → 30 fotos (não apague!)
- widgets.js        → opcional, só cópia de segurança


- index.html    → Página inicial (carrossel clicável + vídeos + guias)
- destino.html  → PÁGINA NOVA: abre ao clicar num destino (mapa, documentos,
                  culinária, imperdíveis, fotos, vídeo, dica)
- servicos.html → Serviços (Wise, Nomad, 7 plataformas de hotéis + Marcenaria)
- noticias.html → Notícias & Vistos (ETIAS/EES + passaporte + brasileiros no exterior + vacina)
- sua-imagem.jpg → Banner oficial do topo
- fotos/        → Pasta com 30 fotos dos destinos (NÃO apague! O site usa elas)

O QUE MUDOU NESTA VERSÃO
------------------------
1) "Destino do Dia" REMOVIDO. Agora só existe "🗺️ Explore Destinos Imperdíveis" (novo nome na v3).
2) Cada card do carrossel é CLICÁVEL e abre a página completa do destino
   (destino.html) com: informações rápidas, documentos, mapa do Google,
   5 lugares imperdíveis, culinária, 3 fotos com créditos e vídeo.
3) Na página do destino há botões "← anterior / próximo →" para passear
   pelos 10 destinos em sequência.
4) Vídeos das redes: agora aceitam PLAYER embutido de YouTube, TikTok e
   Instagram (basta colar o link do vídeo específico — veja abaixo).

COMO EDITAR OS TEXTOS DE UM DESTINO
-----------------------------------
Abra destino.html, procure pelo nome do destino e troque os textos
(resumo, documentos, lugares, culinária, dica). Para trocar o VÍDEO,
troque o 'videoId' pelo código do novo vídeo do YouTube
(ex: em youtube.com/watch?v=XXXX, o ID é o XXXX).
Para trocar FOTOS, substitua os arquivos na pasta fotos/ mantendo o
mesmo nome (ex: piran-1.jpg) — tamanho sugerido: 1200 px de largura.

COMO ATUALIZAR OS 3 VÍDEOS DAS REDES (1 minuto)
----------------------------------------------
1. Abra o vídeo no TikTok, Instagram ou YouTube;
2. Toque em Compartilhar → Copiar link;
3. Abra index.html, procure por "const videosRede = [" e cole cada link
   no 'url' correspondente + ajuste o 'titulo'. Salve e publique.
   - Link de VÍDEO específico → vira PLAYER dentro da página.
   - Link de PERFIL → vira cartão com botão "Assistir".
IMPORTANTE: TikTok e Instagram não permitem buscar os vídeos
automaticamente de graça — por isso os links precisam ser colados
manualmente a cada postagem (versão automática só com ferramenta paga).

COMO PUBLICAR (NETLIFY)
-----------------------
1. Extraia o ZIP inteiro (com a pasta fotos/ junto!);
2. No app.netlify.com → seu site → Deploys, arraste a PASTA extraída;
3. Pronto! Teste clicando nos destinos e nos vídeos.

NOVIDADES DA v3
-------------
- Nome novo da seção: "Explore Destinos Imperdíveis".
- ZOOM nas fotos: clique em qualquer foto da página do destino para
  ampliar; troque com as setas, o teclado ou arrastando o dedo.
- Galeria "sempre atualizada" (Wikimedia Commons): cada destino busca
  fotos novas sozinho na internet — renova sem mexer no código.
  As 3 fotos escolhidas a dedo continuam como galeria principal.
- Botões "Google Imagens" e "Unsplash" em cada destino para o visitante
  explorar milhares de fotos externas.

DÚVIDAS? Me chame que eu ajusto qualquer texto, destino, cor ou vídeo!
