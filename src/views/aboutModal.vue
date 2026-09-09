<template>
  <div class="modal fade" id="aboutModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ $t("about.about") }}</h5>
          <i class="bi-x close-modal" data-bs-dismiss="modal"></i>
        </div>
        <div class="modal-body text-center">
          <img class="logo" src="/img/weektodo-isologo-color.svg" alt="BetterWeekToDo logo" width="256" />
          <img class="logo logo-white" src="/img/weektodo-isologo-white.svg" alt="BetterWeekToDo logo" width="256" />
          <h5 class="mt-3 mb-1">BetterWeekToDo</h5>
          <p class="mb-1" style="font-size: 0.8rem">{{ $t("about.version") }} {{ version }}</p>
          <p class="mb-0" style="font-size: 0.8rem">
            Self-hosted weekly planning with local-first storage and optional accounts.
          </p>
          <p class="mb-1 mt-3" style="font-size: 0.75rem">
            Copyright © 2026 BetterWeekToDo contributors
          </p>
          <p class="mb-1" style="font-size: 0.75rem">
            Forked from <a href="https://github.com/manuelernestog/weektodo" target="_blank" rel="noopener">WeekToDo</a> by Manuel Ernesto Garcia
          </p>
          <p class="mb-1" style="font-size: 0.75rem">
            Licensed under <a href="/LICENSE" target="_blank" rel="noopener">GNU GPL v3.0 only</a> ·
            <a href="https://github.com/JonasTrampe/BetterWeekToDo" target="_blank" rel="noopener">Source code</a>
          </p>
          <p class="mb-0" style="font-size: 0.75rem">
            This program comes with absolutely no warranty.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import versionJson from "../../public/version.json";

export default {
  name: "aboutModal",
  data() {
    return { version: versionJson.version };
  },
};
</script>

<style scoped>
.modal-dialog { max-width: 360px; }
.logo-white { display: none; }
.dark-theme .logo { display: none; }
.dark-theme .logo-white { display: inline-block; opacity: 0.95; }
</style>
