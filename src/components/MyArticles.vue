<template>
  <div>
    <a href="/#/" class="button is-primary fbs"><< Back</a>
    <div class="columns is-mobile is-centered has-text-left">
      <div class="column is-half is-narrow">
        <p>My Articles ( {{Object.keys(articles).length}} )</p><br>
        <div v-if="articlesExist">
          <div v-for="article in articles">
            <div v-if="article['source'] != 'PAT'" class="card">
              <div class="card-content">
                <div class="content">
                  <p>
                      <b>{{ article['title'] }}</b> <br>
                      <small>
                        <span v-if="article['journalInfo']">
                          {{ article['journalInfo']['journal']['title'] }}, {{ article['journalInfo']['printPublicationDate'] }} 
                        </span>
                        <span class="is-pulled-right">
                            <span v-if="article['isOpenAccess'] == 'Y'">
                              <span class="tag is-info">Open Source</span>
                            </span>
                        </span>
                      </small>
                    </span>
                  </p>
                  <hr class="np">
                  {{ article['abstractText'] }}
                  <span v-if="article['chem']">
                    <hr class="np">
                    <span v-for="chem in article['chem']">
                      <span class="tag is-light">{{ chem }}</span>&nbsp;
                    </span>
                  </span>
                </div>
              </div>
              <footer class="card-footer">
                <a target="_blank" :href="'http://dx.doi.org/'+article['doi']" class="card-footer-item">{{ article['doi']}}</a>
                <a @click="removeArticle(article['id'])" class="card-footer-item">Remove</a>
              </footer>
            </div>
            <br>
          </div>
        </div>
        <div v-if="!articlesExist">
          <p class="has-text-grey"><small>No Articles Saved</small></p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios';

export default {
  name: 'DataSearch',
  data () {
    return {
      articles: {}
    }
  },
  mounted: function () {
    this.$nextTick(function () {
      this.loadArticles()
    })
  },
  methods: {
    loadArticles () {
      this.articles = JSON.parse(localStorage.getItem("myArticles"))
    },
    removeArticle (id) {
      this.articles = JSON.parse(localStorage.getItem("myArticles"))
      delete this.articles[id]
      localStorage.setItem("myArticles", JSON.stringify(this.articles) )
    }
  },
  computed:{
    articlesExist: function(){
      return Object.keys(this.articles).length;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.fbs{
  position: fixed;
  bottom: 10px;
  right: 10px;
}

h1, h2 {
  font-weight: normal;
}

hr.np{
  margin: 1.5em -1.5em;
}

.content{
  overflow-x: hidden !important;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
