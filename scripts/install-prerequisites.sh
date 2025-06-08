#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detect OS
OS="$(uname -s)"
ARCH="$(uname -m)"

echo -e "${BLUE}🚀 SaaS Boilerplate Prerequisites Installer${NC}"
echo -e "${BLUE}===========================================${NC}\n"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Homebrew (macOS)
install_homebrew() {
    if [[ "$OS" == "Darwin" ]] && ! command_exists brew; then
        echo -e "${YELLOW}Installing Homebrew...${NC}"
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # Add Homebrew to PATH for Apple Silicon Macs
        if [[ "$ARCH" == "arm64" ]]; then
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
            eval "$(/opt/homebrew/bin/brew shellenv)"
        fi
    fi
}

# Function to install nvm
install_nvm() {
    echo -e "${YELLOW}Installing nvm (Node Version Manager)...${NC}"
    
    # Download and install nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    
    # Load nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    
    echo -e "${GREEN}✓ nvm installed${NC}"
}

# Function to install Node.js via nvm
install_node() {
    echo -e "${YELLOW}Installing Node.js v18 via nvm...${NC}"
    
    # Load nvm if not already loaded
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    # Install and use Node.js 18
    nvm install 18
    nvm use 18
    nvm alias default 18
    
    echo -e "${GREEN}✓ Node.js $(node --version) installed${NC}"
}

# Function to install pyenv
install_pyenv() {
    echo -e "${YELLOW}Installing pyenv (Python Version Manager)...${NC}"
    
    if [[ "$OS" == "Darwin" ]]; then
        # macOS
        if command_exists brew; then
            brew install pyenv
        else
            curl https://pyenv.run | bash
        fi
    else
        # Linux
        curl https://pyenv.run | bash
    fi
    
    # Add pyenv to shell
    echo '' >> ~/.bashrc
    echo '# pyenv' >> ~/.bashrc
    echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
    echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
    echo 'eval "$(pyenv init -)"' >> ~/.bashrc
    
    # Also add to zshrc if using zsh
    if [ -f ~/.zshrc ]; then
        echo '' >> ~/.zshrc
        echo '# pyenv' >> ~/.zshrc
        echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshrc
        echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zshrc
        echo 'eval "$(pyenv init -)"' >> ~/.zshrc
    fi
    
    # Load pyenv
    export PYENV_ROOT="$HOME/.pyenv"
    export PATH="$PYENV_ROOT/bin:$PATH"
    eval "$(pyenv init -)"
    
    echo -e "${GREEN}✓ pyenv installed${NC}"
}

# Function to install Python via pyenv
install_python() {
    echo -e "${YELLOW}Installing Python 3.11 via pyenv...${NC}"
    
    # Load pyenv if not already loaded
    export PYENV_ROOT="$HOME/.pyenv"
    export PATH="$PYENV_ROOT/bin:$PATH"
    eval "$(pyenv init -)"
    
    # Install Python dependencies first
    if [[ "$OS" == "Darwin" ]]; then
        # macOS dependencies
        brew install openssl readline sqlite3 xz zlib tcl-tk
    else
        # Linux dependencies
        sudo apt-get update
        sudo apt-get install -y make build-essential libssl-dev zlib1g-dev \
            libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
            libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev \
            libffi-dev liblzma-dev
    fi
    
    # Install Python 3.11
    pyenv install 3.11
    pyenv global 3.11
    
    echo -e "${GREEN}✓ Python $(python --version) installed${NC}"
}

# Function to install Docker
install_docker() {
    echo -e "${YELLOW}Installing Docker...${NC}"
    
    if [[ "$OS" == "Darwin" ]]; then
        # macOS - Install Docker Desktop
        if ! command_exists docker; then
            echo -e "${BLUE}Please install Docker Desktop manually from:${NC}"
            echo -e "${BLUE}https://www.docker.com/products/docker-desktop/${NC}"
            echo -e "${YELLOW}Press Enter after installation is complete...${NC}"
            read -r
            
            # Wait for Docker to be available
            while ! command_exists docker; do
                echo -e "${YELLOW}Waiting for Docker installation...${NC}"
                sleep 2
            done
        fi
    else
        # Linux - Install Docker Engine
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        echo -e "${YELLOW}Note: You may need to log out and back in for Docker permissions${NC}"
    fi
    
    echo -e "${GREEN}✓ Docker installed${NC}"
}

# Main installation flow
main() {
    echo -e "${BLUE}Checking system prerequisites...${NC}\n"
    
    # Install Homebrew on macOS
    if [[ "$OS" == "Darwin" ]]; then
        install_homebrew
    fi
    
    # Check and install Node.js
    if ! command_exists node || [[ $(node --version | cut -d'.' -f1 | cut -d'v' -f2) -lt 18 ]]; then
        if ! command_exists nvm; then
            install_nvm
        fi
        install_node
    else
        echo -e "${GREEN}✓ Node.js $(node --version) already installed${NC}"
    fi
    
    # Check and install Python
    if ! command_exists python3 || [[ $(python3 --version | cut -d' ' -f2 | cut -d'.' -f2) -lt 11 ]]; then
        if ! command_exists pyenv; then
            install_pyenv
        fi
        install_python
    else
        echo -e "${GREEN}✓ Python $(python3 --version) already installed${NC}"
    fi
    
    # Check and install Docker
    if ! command_exists docker; then
        install_docker
    else
        echo -e "${GREEN}✓ Docker already installed${NC}"
        
        # Check if Docker daemon is running
        if ! docker info >/dev/null 2>&1; then
            echo -e "${YELLOW}Docker is installed but not running. Please start Docker Desktop.${NC}"
            
            if [[ "$OS" == "Darwin" ]]; then
                echo -e "${YELLOW}Starting Docker Desktop...${NC}"
                open -a Docker
                
                # Wait for Docker to start
                echo -e "${YELLOW}Waiting for Docker to start...${NC}"
                while ! docker info >/dev/null 2>&1; do
                    sleep 2
                done
                echo -e "${GREEN}✓ Docker is running${NC}"
            fi
        fi
    fi
    
    echo -e "\n${GREEN}✅ All prerequisites installed!${NC}"
    echo -e "${BLUE}You can now proceed with the setup.${NC}\n"
    
    # Remind user to reload shell
    echo -e "${YELLOW}⚠️  Important: Please run the following command to reload your shell:${NC}"
    echo -e "${BLUE}source ~/.bashrc${NC} or ${BLUE}source ~/.zshrc${NC}\n"
}

# Run main function
main