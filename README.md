# Guia Definitivo: Colocando o NEXUS-HUB Online (VPS + Portainer)

Neste guia, você verá o passo a passo exato para subir o **NEXUS HUB** na sua VPS sem interferir no sistema original.

## 🟢 PASSO 1: Enviar o código para o GitHub

O código do HUB está pronto na sua máquina (nesta pasta `NEXUS-HUB`). Precisamos enviá-lo para a internet (seu GitHub).

1. Abra o [GitHub](https://github.com/) e faça login.
2. Clique no botão de criar **New** (Novo Repositório).
3. Dê o nome de `nexus-hub` (ou o que preferir) e deixe marcado como **Private** (Privado) para ninguém ver seu código.
4. Não marque nenhuma caixa adicional (nada de README), apenas clique no botão verde **Create repository**.
5. Ele vai te mostrar uma tela com um link (ex: `https://github.com/SeuUsuario/nexus-hub.git`). Copie este link.

**No seu Computador (Aja agora):**
Neste seu terminal do VSCode/Trae, garanta que você está na pasta `NEXUS-HUB` e cole estes comandos rodando um de cada vez (não esqueça de trocar a URL pela sua antes de rodar a penúltima linha):

```bash
git init
git add .
git commit -m "Meu primeiro deploy do Hub"
git branch -M main
git remote add origin COLOQUE_O_LINK_DO_SEU_GITHUB_COPIADO_AQUI
git push -u origin main
```
*Se for a primeira vez no Github do Trae/VSCode, ele pode abrir uma janelinha pedindo para você autorizar o login do Github. Pode prosseguir.*

Pronto! Seus arquivos já estão seguros e salvos na nuvem do seu repositório.

---

## 🟢 PASSO 2: Configurando no Portainer (Na sua VPS)

Agora vamos lá para o site do seu **Portainer** (onde o X360C de produção na VPS já está rodando). Nós daremos a ordem para que o Portainer "puxe" automaticamente o seu código do GitHub.

1. Faça login no seu **Portainer** e clique em **Local** (seu ambiente padrão de contêineres).
2. No menu lateral esquerdo, clique em **Stacks**.
3. No canto direito acima, clique em **Add Stack**.
4. Dê um nome simples para ele: `nexus-hub-stack`

### Configurando o Repositório do GitHub na Plataforma:
Logo abaixo do nome, você verá uma opção chamada **Build method** (Método de Construção).
1. Clique na aba **Repository** (Repositório Web/Git).
2. Em **Repository URL**, cole o link do seu novo repositório do github que criamos no Passo 1.
3. Em **Repository reference**, digite exatamente: `refs/heads/main`
4. Em **Compose path**, pode deixar o padrão que já deve estar lá marcando `docker-compose.yml`.
5. Como seu GitHub é Privado, ligue a chavinha (Switch) de **Authentication**. Informe seu usuário do Github, e a senha tem que ser um [Personal Access Token gerado no Github](https://github.com/settings/tokens) (o mesmo que você certamente usou para o X360C no Portainer, basta reciclar).

Role até o fundo da página e clique no grande botão azul: **Deploy the stack**.

> **Beba uma água, vai demorar uns minutinhos!** (Entre 3 a 8 minutos).
> O Portainer está construindo a sua máquina localmente através do arquivo Dockerfile (compilando o motor SQlite) e reconectando as vias de acesso ao banco.

---

## 🟢 PASSO 3: Acessando e Configurando o seu NEXUS HUB Online

Quando o Portainer der a mensagem verdinha de sucesso (Success), nós já terminamos!

1. Acesse o IP ou domínio que chega na sua VPS com a nova porta anexada no fim do caminho. Exemplo: `http://192.168.1.100:3001` (substitua pelo IP real da sua VPS).
2. Você já visualizará a nossa nova interface do HUB.
3. Observe que já vai constar os SEUS usuários e chips que existem e operam na sua Produção ativa, porque nós mapeamos o Volume!

O painel já vai se atualizar sozinho a cada intervalo se os usuários se movimentarem ou se seus chips saírem do ar lá dentro.

Boas visualizações! 🚀
