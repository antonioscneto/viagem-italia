window.TripSync = (() => {
  const config = window.TRIP_CONFIG ?? {};

  function isConfigured() {
    return typeof config.supabaseUrl === "string" && config.supabaseUrl.startsWith("https://") &&
      typeof config.supabaseAnonKey === "string" && config.supabaseAnonKey.length > 20;
  }

  async function request(code, action, data = {}) {
    if (!isConfigured()) {
      throw new Error("A sincronização ainda não foi configurada.");
    }

    let response;
    try {
      response = await fetch(`${config.supabaseUrl.replace(/\/$/, "")}/functions/v1/trip-sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: config.supabaseAnonKey,
          Authorization: `Bearer ${config.supabaseAnonKey}`
        },
        body: JSON.stringify({ code, action, ...data })
      });
    } catch {
      throw new Error("Sem conexão com a internet. Confira a conexão e tente novamente.");
    }

    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error("O servidor respondeu em um formato inesperado.");
    }

    if (!response.ok) {
      if (response.status === 401) throw new Error("Código de acesso incorreto.");
      if (response.status === 429) throw new Error(result.error || "Muitas tentativas. Aguarde 15 minutos e tente novamente.");
      if (response.status === 409) throw new Error(result.error || "Outra pessoa atualizou os dados. Recarregue o app.");
      throw new Error(result.error || "Não foi possível falar com o servidor. Tente novamente.");
    }
    return result;
  }

  return {
    isConfigured,
    load(code) {
      return request(code, "load");
    },
    save(code, snapshot, revision) {
      return request(code, "save", {
        revision,
        payments: snapshot.payments,
        visited: snapshot.visited,
        checklist: snapshot.checklist
      });
    }
  };
})();
