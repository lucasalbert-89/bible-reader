# 📖 Bíblia • Planos de Leitura Diária (365, 180 e 90 Dias)

Aplicação moderna e inspiradora para leitura e acompanhamento devocional da Bíblia Sagrada em múltiplos planos com sincronização em nuvem via **Supabase** e deploy contínuo no **Render**.

---

## ✨ Funcionalidades Principais

- **3 Planos de Leitura Completos**:
  - **Plano 365 Dias (1 Ano)**: Antigo Testamento, Sapienciais/Salmos e Novo Testamento (~3-4 capítulos/dia).
  - **Plano 180 Dias (6 Meses)**: Toda a Bíblia em ritmo semestral focado (~6-7 capítulos/dia).
  - **Plano 90 Dias (3 Meses)**: Imersão intensiva nas Escrituras (~13-14 capítulos/dia).
- **Modo Visitante (Sem Login)**:
  - Navegue e leia livremente sem precisar de cadastro.
  - O progresso fica salvo no navegador (`localStorage`).
- **Autenticação e Nuvem com Supabase**:
  - Login e Cadastro simples com E-mail e Senha.
  - **Sincronização Automática**: Se o visitante marcar dias antes de logar, o progresso acumulado é transferido para a sua conta na nuvem assim que fizer login.
  - Segurança com **Row Level Security (RLS)**: cada usuário tem acesso estritamente aos seus próprios dados.
- **Experiência Visual e Devocional**:
  - Modal da leitura diária com passagens organizadas por testamento/categoria.
  - **"A Mensagem"**: Versículo diário em destaque com tipografia *Crimson Pro* e reflexão espiritual edificante.
  - Botão de **Compartilhar** com 1 clique (para WhatsApp, redes sociais ou copiar texto formatado).
  - Animações suaves de progresso e botões com micro-interações sem distrações (sem confetti).
  - Modos **Dark** (Slate escuro com toques neon) e **Light** (Claro suave).

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Backend & Banco de Dados**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS)
- **Hospedagem**: [On Render](https://render.com/) (Static Site Gratuito)

---

## 🚀 Como Configurar o Projeto

### 1. Configurar o Supabase

1. Acesse [supabase.com](https://supabase.com) e entre clicando em **"Sign in with GitHub"**.
2. Clique em **"New Project"**, dê um nome (ex: `biblia-planos`) e crie uma senha para o banco de dados.
3. No menu lateral do Supabase, clique em **SQL Editor** > **New Query**.
4. Abra o arquivo `supabase_schema.sql` deste projeto, copie todo o conteúdo, cole no SQL Editor do Supabase e clique em **"Run"** (Ctrl + Enter).
5. No menu lateral esquerdo, vá em **Project Settings** (ícone de engrenagem) > **API**.
6. Copie:
   - **Project URL**
   - **anon / public key**
7. No seu projeto local, abra o arquivo `.env` e preencha:
   ```env
   VITE_SUPABASE_URL=https://seu-id.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
   ```

---

### 2. Rodar Localmente

```bash
# Instalar dependências (caso ainda não tenha feito)
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Abra no navegador em `http://localhost:3000`.

---

### 3. Como Subir para o GitHub

1. Inicialize o repositório git e faça o primeiro commit:
   ```bash
   git init
   git add .
   git commit -m "feat: Bíblia Planos de Leitura com Supabase e Render"
   ```
2. Crie um novo repositório no seu GitHub (ex: `biblia-planos`).
3. Vincule e envie o código:
   ```bash
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/biblia-planos.git
   git push -u origin main
   ```

---

### 4. Como Hospedar no On Render (Grátis)

1. Acesse [render.com](https://render.com) e entre com sua conta do **GitHub**.
2. Clique em **"New +"** no topo e selecione **"Static Site"**.
3. Escolha o repositório `biblia-planos` que você acabou de subir no GitHub.
4. Preencha as configurações:
   - **Name**: `biblia-planos` (ou o nome que preferir)
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Na seção **Environment Variables** (Variáveis de Ambiente), adicione:
   - `VITE_SUPABASE_URL` = sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` = sua anon key do Supabase
6. Clique em **"Create Static Site"**.

Pronto! Em 1 minuto o Render compilará e fornecerá um link público com HTTPS gratuito (ex: `https://biblia-planos.onrender.com`). A cada novo `git push`, o Render atualizará seu site automaticamente!

---

## 📄 Licença

Projeto desenvolvido para fins de edificação espiritual e uso comunitário. Sinta-se livre para customizar!
