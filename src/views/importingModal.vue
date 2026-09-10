<template>
  <div class="modal  fade" :id="id" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body d-flex align-items-center justify-content-center">
          <div class="loading-spinner">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div> {{ text }} </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: "importingModal",
  props: {
    text: { type: String, required: true },
    id: { type: String, required: true },
  },
}


</script>

<style scoped>
.loading-spinner {
  position: relative;
  top: unset;
  height: unset;
  margin: unset;
  margin-right: 20px;
}

.modal-dialog {
  max-width: 250px;
}

.modal-body {
  height: 70px;
}

.modal-content {
  padding: 10px 20px 10px 20px;
}

.bi-info-circle {
  background: -webkit-linear-gradient(180deg, #c86d3e 0%, #b85c35 90%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.dark-theme .bi-info-circle {
  background: -webkit-linear-gradient(180deg, #e08a5c 0%, #c86d3e 90%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>