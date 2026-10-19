# Debian の /etc/profile はログインシェルで PATH を上書きするため、ここで前に足し直す。
# 非対話の SSH セッションは sshd_config の SetEnv で同じ PATH にしている
PATH="/home/dev/.local/share/mise/shims:/home/dev/.local/bin:$PATH"
export PATH
