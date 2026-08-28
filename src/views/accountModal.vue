<template>
  <div class="modal fade" id="accountModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered"><div class="modal-content">
      <div class="modal-header"><h5 class="modal-title">Account</h5><i class="bi-x close-modal" data-bs-dismiss="modal"></i></div>
      <form class="modal-body" @submit.prevent="submit">
        <template v-if="user"><p>Signed in as <strong>{{ user.email }}</strong>.</p><p class="small text-muted">Cloud backup and restore require an explicit choice before local data is changed.</p><button class="btn btn-outline-danger w-100" type="button" @click="signOut">Sign out</button></template>
        <template v-else>
          <p class="small text-muted">{{ registerMode ? "Create an account and verify your email." : "Sign in to your self-hosted account." }}</p>
          <input v-model.trim="email" class="form-control mb-3" type="email" autocomplete="email" placeholder="Email" required>
          <input v-model="password" class="form-control mb-3" type="password" :autocomplete="registerMode ? 'new-password' : 'current-password'" placeholder="Password (12+ characters)" minlength="12" maxlength="72" required>
          <p v-if="message" class="small" :class="error ? 'text-danger' : 'text-success'">{{ message }}</p>
          <button class="btn btn-primary w-100" :disabled="submitting">{{ registerMode ? "Create account" : "Sign in" }}</button>
          <button v-if="registrationEnabled" class="btn btn-link w-100 mt-2" type="button" @click="toggleMode">{{ registerMode ? "Already have an account? Sign in" : "Create an account" }}</button>
          <a v-if="oidcEnabled" class="btn btn-outline-secondary w-100 mt-2" href="/api/auth/oidc/login">Use another provider</a>
        </template>
      </form>
    </div></div>
  </div>
</template>
<script>
import { Modal } from "bootstrap";
import accountService from "../services/accountService";
export default { name: "accountModal", data() { return { user: null, email: "", password: "", registerMode: false, registrationEnabled: false, oidcEnabled: false, submitting: false, message: "", error: false }; }, methods: {
  async open() { this.message = ""; try { [this.user, { registrationEnabled: this.registrationEnabled, oidcEnabled: this.oidcEnabled }] = await Promise.all([accountService.me(), accountService.config()]); } catch (_error) { this.user = null; const authConfig = await accountService.config(); this.registrationEnabled = authConfig.registrationEnabled; this.oidcEnabled = authConfig.oidcEnabled; } new Modal(document.getElementById("accountModal")).show(); },
  async submit() { this.submitting = true; this.message = ""; this.error = false; try { if (this.registerMode) { this.message = (await accountService.register(this.email, this.password)).message; } else { this.user = await accountService.login(this.email, this.password); this.password = ""; } } catch (error) { this.error = true; this.message = error.message; } finally { this.submitting = false; } },
  async signOut() { await accountService.logout(); this.user = null; },
  toggleMode() { this.registerMode = !this.registerMode && this.registrationEnabled; this.message = ""; this.error = false; },
} };
</script>
