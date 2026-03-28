document.addEventListener("DOMContentLoaded", () => {
    // IMPORTANTE: Insira seu número real com código do país e DDD
    const WHATSAPP_NUMBER = "5511963692499"; 

    const serviceCards = document.querySelectorAll(".add-to-cart-btn");
    const quoteModal = document.getElementById("quote-modal");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const sendWhatsappBtn = document.getElementById("send-whatsapp-btn");
    const selectedServiceTitle = document.getElementById("selected-service-title");

    let currentSelectedService = "";

    // Busca de CEP Automática via API ViaCEP
    const buscarCEP = async (cepInputId, addressInputId) => {
        const cepInput = document.getElementById(cepInputId);
        const addressInput = document.getElementById(addressInputId);
        let cep = cepInput.value.replace(/\D/g, ''); 

        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                
                if (!data.erro) {
                    addressInput.value = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
                } else {
                    Toastify({
                        text: "CEP não encontrado. Digite o endereço manualmente.",
                        duration: 3000,
                        style: { background: "#ffcc00", color: "#000" }
                    }).showToast();
                }
            } catch (error) {
                console.error("Erro na busca do CEP:", error);
            }
        }
    };

    document.getElementById("cep-origin").addEventListener("input", (e) => {
        if(e.target.value.replace(/\D/g, '').length === 8) buscarCEP("cep-origin", "origin");
    });
    document.getElementById("cep-destination").addEventListener("input", (e) => {
        if(e.target.value.replace(/\D/g, '').length === 8) buscarCEP("cep-destination", "destination");
    });

    // Abrir modal
    serviceCards.forEach(card => {
        card.addEventListener("click", (e) => {
            currentSelectedService = e.currentTarget.getAttribute("data-name");
            selectedServiceTitle.textContent = `Orçamento: ${currentSelectedService}`;
            resetForm();
            quoteModal.classList.remove("hidden");
        });
    });

    // Fechar modal
    closeModalBtn.addEventListener("click", () => quoteModal.classList.add("hidden"));
    quoteModal.addEventListener("click", (e) => {
        if (e.target === quoteModal) quoteModal.classList.add("hidden");
    });

    // Lógica dos Contadores
    const counterBtns = document.querySelectorAll(".counter-btn");
    counterBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const action = e.target.getAttribute("data-action");
            const targetId = e.target.getAttribute("data-target");
            const countElement = document.getElementById(targetId);
            let currentCount = parseInt(countElement.textContent);

            if (action === "plus") {
                currentCount++;
            } else if (action === "minus" && currentCount > 0) {
                currentCount--;
            }
            countElement.textContent = currentCount;
        });
    });

    // Envio para o WhatsApp
    sendWhatsappBtn.addEventListener("click", () => {
        const origin = document.getElementById("origin").value.trim();
        const numOrigin = document.getElementById("num-origin").value.trim();
        const destination = document.getElementById("destination").value.trim();
        const numDestination = document.getElementById("num-destination").value.trim();
        
        const accessType = document.getElementById("access-type").value;
        const helpers = document.getElementById("helpers").value;
        const assembly = document.getElementById("assembly").value;
        const extraItems = document.getElementById("extra-items").value.trim();

        if (!origin || !destination) {
            Toastify({
                text: "⚠️ Preencha a Rua/Bairro de Retirada e Entrega!",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "center",
                style: { background: "#ff4d4d" }
            }).showToast();
            return;
        }

        if (!accessType) {
            Toastify({
                text: "⚠️ Informe o tipo de acesso (Escadas/Elevador).",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "center",
                style: { background: "#ff4d4d" }
            }).showToast();
            return;
        }

        // Mapeamento dos itens separados
        let inventoryText = "";
        const items = [
            { id: "item-geladeira", label: "Geladeira(s)" },
            { id: "item-fogao", label: "Fogão" },
            { id: "item-maquina", label: "Máquina de Lavar" },
            { id: "item-sofa", label: "Sofá(s)" },
            { id: "item-rack", label: "Rack(s)" },
            { id: "item-painel", label: "Painel de TV" },
            { id: "item-mesa", label: "Mesa(s)" },
            { id: "item-cama", label: "Cama(s)" },
            { id: "item-colchao", label: "Colchão" },
            { id: "item-armario", label: "Guarda-Roupa(s)" },
            { id: "item-caixas", label: "Caixas/Sacos (Aprox.)" }
        ];

        items.forEach(item => {
            const countElement = document.getElementById(item.id);
            if (countElement) {
                const count = parseInt(countElement.textContent);
                if (count > 0) {
                    inventoryText += `🔹 ${count}x ${item.label}\n`;
                }
            }
        });

        // Formatação do Endereço com Número
        const fullOrigin = numOrigin ? `${origin}, ${numOrigin}` : origin;
        const fullDestination = numDestination ? `${destination}, ${numDestination}` : destination;

        // Montagem final do texto
        let message = `*NOVO PEDIDO DE ORÇAMENTO* 🚚\n\n`;
        message += `*Serviço:* ${currentSelectedService}\n`;
        message += `📍 *Retirada:* ${fullOrigin}\n`;
        message += `🏁 *Entrega:* ${fullDestination}\n`;
        message += `🏢 *Acesso/Imóvel:* ${accessType}\n\n`;
        
        message += `*SERVIÇOS EXTRAS:*\n`;
        message += `👷 ${helpers}\n`;
        message += `🛠️ ${assembly}\n\n`;

        message += `*INVENTÁRIO PRINCIPAL:*\n`;
        if (inventoryText === "" && !extraItems) {
            message += `_Apenas itens miúdos ou não informados._\n`;
        } else {
            message += inventoryText;
            if (extraItems) message += `\n*Outros/Avisos:* ${extraItems}\n`;
        }

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

        window.open(whatsappUrl, "_blank");
        quoteModal.classList.add("hidden");
    });

    // Limpar Formulário
    function resetForm() {
        document.querySelectorAll("input[type='text']").forEach(input => input.value = "");
        document.getElementById("access-type").value = "";
        document.getElementById("helpers").value = "Somente o Motorista";
        document.getElementById("assembly").value = "Sem montagem";
        document.querySelectorAll(".item-count").forEach(span => span.textContent = "0");
    }

    // Badge de Horário
    const updateStatusBadge = () => {
        const badge = document.getElementById("status-badge");
        const statusText = document.getElementById("status-text");
        const now = new Date();
        const hour = now.getHours();

        if (hour >= 8 && hour < 18) {
            badge.classList.add("bg-green-500", "shadow-[0_0_15px_rgba(34,197,94,0.5)]");
            badge.classList.remove("bg-red-500", "shadow-[0_0_15px_rgba(239,68,68,0.5)]");
            statusText.textContent = "🟢 Aberto Agora";
        } else {
            badge.classList.add("bg-red-500", "shadow-[0_0_15px_rgba(239,68,68,0.5)]");
            badge.classList.remove("bg-green-500", "shadow-[0_0_15px_rgba(34,197,94,0.5)]");
            statusText.textContent = "🔴 Fechado (Envie msg e aguarde)";
        }
    };

    updateStatusBadge();
});
