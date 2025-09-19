# ASALPI - Sindicato

Este projeto é o site institucional da ASALPI, com frontend em HTML/CSS/JS e backend em Flask (pasta `news_backend`). O objetivo é divulgar informações, notícias, diretoria, convênios e documentos da associação.

## Estrutura do Projeto

```
web-site/
  projeto/
    index.html
    src/
      css/
      js/
      assets/
    ...
news_backend/
  app.py
  requirements.txt
  ...
```

## Frontend

- Localização: `web-site/projeto/`
- Tecnologias: HTML, CSS, JavaScript
- Principais páginas: 
  - `index.html` (principal)
  - `NewsList.html` (notícias)
  - `clube.html`, `escola.html`, `colonia.html` (institucional)

### Como rodar o frontend

Abra o arquivo `index.html` em seu navegador.

## Backend (Flask)

- Localização: `news_backend/`
- Tecnologias: Python, Flask
- Função: API para gerenciamento de notícias e integração com o frontend.

### Como rodar o backend

1. Instale as dependências:
   ```bash
   cd news_backend
   pip install -r requirements.txt
   ```

2. Execute o servidor Flask:
   ```bash
   python app.py
   ```

O backend irá rodar por padrão em `http://localhost:5000`.

## Integração

O frontend pode consumir a API do backend para exibir notícias dinâmicas na página `NewsList.html`.

## Acessibilidade

O site segue boas práticas de acessibilidade, com navegação por teclado, textos alternativos em imagens e estrutura semântica.

## Contribuição

Sinta-se livre para abrir issues ou pull requests com melhorias.

## Licença

Este projeto é distribuído sob licença MIT.

git rm -r --cached /news_backed/__pycache__