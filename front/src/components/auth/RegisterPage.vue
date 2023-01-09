<template>
  <div class="q-pa-xl">
    <div class="flex flex-center column">
      <h1 class="q-mb-lg">Inscrivez vous</h1>
      <q-card>
        <q-card-section>
          <q-input label="Email" type="email" outlined class="q-mb-md" v-model="form.email"/>
          <q-input label="Mot de passe" type="password" outlined class="q-mb-md" v-model="form.password" />
          <q-checkbox label="terms and conditions" v-model="form.terms_and_conditions"/>
          <q-btn label="S'inscrire" class="full-width" color="primary" @click="handleRegister"/>
          <p>Vous avez déjà un compte ? <a href="">Connectez vous</a></p>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useUserStore } from 'stores/user-store'
import { Notify } from 'quasar'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const form = ref({
  email: '',
  password: '',
  terms_and_conditions: false
})

const handleRegister = () => {
  try {
    userStore.handleRegister(form.value)
    router.push({ name: 'dashboard' })
  } catch (e) {
    Notify.create('Error during register')
  }
}
</script>
