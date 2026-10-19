# Orca から SSH で入る汎用の開発コンテナ。
# 言語ランタイムはまず mise で入れ、apt でしか入らないものだけここに追記する。

FROM debian:trixie-slim

ENV DEBIAN_FRONTEND=noninteractive \
    TZ=Asia/Tokyo

RUN apt-get update && apt-get install -y --no-install-recommends \
        openssh-server git curl ca-certificates jq ripgrep fzf procps less sudo \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg -o /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
        > /etc/apt/sources.list.d/github-cli.list \
    && apt-get update && apt-get install -y --no-install-recommends gh \
    && rm -rf /var/lib/apt/lists/*

# mise 本体はイメージ側に置き、イメージの更新で上がるようにする
RUN install -dm 755 /etc/apt/keyrings \
    && curl -fsSL https://mise.jdx.dev/gpg-key.pub -o /etc/apt/keyrings/mise-archive-keyring.asc \
    && echo "deb [signed-by=/etc/apt/keyrings/mise-archive-keyring.asc arch=$(dpkg --print-architecture)] https://mise.jdx.dev/deb stable main" \
        > /etc/apt/sources.list.d/mise.list \
    && apt-get update && apt-get install -y --no-install-recommends mise \
    && rm -rf /var/lib/apt/lists/*

# パスワードはロック（!）ではなく無効（*）にする。ロックだと公開鍵でもログインできない
RUN useradd -m -u 1000 -s /bin/bash dev \
    && usermod -p '*' dev \
    && echo "dev ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/dev \
    && mkdir /workspace && chown dev:dev /workspace

ENV PATH=/home/dev/.local/share/mise/shims:/home/dev/.local/bin:$PATH
COPY mise-config.toml /etc/mise/config.toml
COPY dev-path.sh /etc/profile.d/dev-path.sh

# home は named volume なので、ここで入れた内容は volume の初回作成時にだけコピーされる。
# 以後の更新は Claude Code の自動更新と mise に任せる。
# pnpm は Node に依存しない mise の単体バイナリにし、プロジェクトが Node の版を変えても消えないようにする。
# package.json の packageManager の版への切り替えは pnpm 自身が行う
USER dev
RUN curl -fsSL https://claude.ai/install.sh | bash
RUN mise use -g node@24 pnpm@latest

# Playwright（chromium）が要る OS のライブラリとフォント。apt で入るので volume には残らず、イメージに入れておく。
# 依存の一覧は Playwright の版ごとに違うため、主に使うプロジェクトの @playwright/test に合わせる。
# root でなければ Playwright が sudo で apt を実行する
ARG PLAYWRIGHT_VERSION=1.63.0
RUN npx -y playwright@${PLAYWRIGHT_VERSION} install-deps chromium \
    && sudo rm -rf /var/lib/apt/lists/* \
    && rm -rf ~/.npm
USER root

COPY sshd_config /etc/ssh/sshd_config
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 22
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
