const STORAGE_KEY = "cadastros-tecweb";

const state = {
  usuarios: loadUsuarios(),
  form: {
    nome: "",
    email: "",
  },
};

const form = document.querySelector("#cadastro-form");
const lista = document.getElementById("lista");
const resumoLista = document.querySelector("#lista-resumo");
const limparCadastrosButton = document.querySelector("#limpar-cadastros");

if (form) {
  setupFormulario();
}

if (lista) {
  setupListagem();
  renderLista();
}

function setupFormulario() {
  const nomeInput = document.getElementById("nome");
  const emailInput = document.getElementById("email");

  nomeInput.addEventListener("input", handleInputChange);
  emailInput.addEventListener("input", handleInputChange);

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    state.form.nome = nomeInput.value.trim();
    state.form.email = emailInput.value.trim();

    const errors = validateForm();
    renderErrors(errors);

    if (Object.keys(errors).length > 0) {
      if (!state.form.nome || !state.form.email) {
        alert("Preencha todos os campos!");
      } else if (!state.form.email.includes("@")) {
        alert("Email invalido!");
      }

      setFormMessage("Corrija os campos destacados antes de enviar.", "error");
      return;
    }

    const novoUsuario = {
      id: Date.now(),
      nome: state.form.nome,
      email: state.form.email,
    };

    addUsuario(novoUsuario);
    form.reset();
    state.form.nome = "";
    state.form.email = "";
    renderErrors({});
    setFormMessage("Cadastro realizado com sucesso.", "success");
  });
}

function setupListagem() {
  if (!limparCadastrosButton) {
    return;
  }

  limparCadastrosButton.addEventListener("click", () => {
    state.usuarios = [];
    saveUsuarios();
    renderLista();
  });
}

function handleInputChange(event) {
  const { name, value } = event.target;
  state.form[name] = value;

  const errors = validateForm();
  renderErrors(errors);

  if (Object.keys(errors).length === 0) {
    setFormMessage("", "");
  }
}

function validateForm() {
  const errors = {};

  if (!state.form.nome.trim()) {
    errors.nome = "Informe o nome.";
  } else if (state.form.nome.trim().length < 3) {
    errors.nome = "O nome precisa ter pelo menos 3 caracteres.";
  }

  if (!state.form.email.trim()) {
    errors.email = "Informe o e-mail.";
  } else if (!isValidEmail(state.form.email)) {
    errors.email = "Digite um e-mail valido.";
  }

  return errors;
}

function renderErrors(errors) {
  setFieldError("nome", errors.nome || "");
  setFieldError("email", errors.email || "");
}

function setFieldError(fieldName, message) {
  const errorElement = document.getElementById(`${fieldName}-erro`);
  const input = document.getElementById(fieldName);

  if (!errorElement || !input) {
    return;
  }

  errorElement.textContent = message;
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

function setFormMessage(message, type) {
  const messageElement = document.getElementById("form-message");

  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.className = "form-message";

  if (type) {
    messageElement.classList.add(type);
  }
}

function renderLista() {
  if (!lista) {
    return;
  }

  lista.innerHTML = "";

  state.usuarios.forEach((usuario) => {
    const item = document.createElement("li");
    item.className = "cadastro-item";
    item.innerHTML = `
      <strong>${escapeHtml(usuario.nome)}</strong>
      <span>${escapeHtml(usuario.email)}</span>
      <span class="status">Cadastro ativo</span>
    `;
    lista.appendChild(item);
  });

  updateResumoLista();
  updateListagemActions();
}

function loadUsuarios() {
  const dadosSalvos = localStorage.getItem(STORAGE_KEY);

  if (!dadosSalvos) {
    return [];
  }

  try {
    const usuarios = JSON.parse(dadosSalvos);
    return Array.isArray(usuarios) ? usuarios : [];
  } catch {
    return [];
  }
}

function saveUsuarios() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.usuarios));
}

function addUsuario(usuario) {
  state.usuarios.push(usuario);
  saveUsuarios();
}

function updateResumoLista() {
  if (!resumoLista) {
    return;
  }

  const totalCadastros = state.usuarios.length;
  resumoLista.textContent =
    totalCadastros === 0
      ? "Nenhum cadastro salvo no momento."
      : `${totalCadastros} cadastro(s) armazenado(s) em memoria e no navegador.`;
}

function updateListagemActions() {
  if (!limparCadastrosButton) {
    return;
  }

  limparCadastrosButton.disabled = state.usuarios.length === 0;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value) {
  const temp = document.createElement("div");
  temp.textContent = value;
  return temp.innerHTML;
}
