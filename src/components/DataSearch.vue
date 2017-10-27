<template>
  <div>
    <a href="/#/my-articles" class="button is-danger fbs">+ My Articles ({{savedArticles}})</a>
    <div class="columns is-mobile is-centered has-text-left">
      <div class="column is-half is-narrow">
        <label class="typo__label">Search terms</label>
        <multiselect v-model="searchTerms" tag-placeholder="Add this as new tag" placeholder="Search or add terms" :options="options" :multiple="true" :taggable="true" @tag="addTag"></multiselect>
        <br>
        <div class="field">
          <div class="control">
            <button  @click="searchEuropeanPMC" class="button is-light is-fullwidth">Search</button>
          </div>
        </div>
        <div v-if="result.ids.length > 0">
          <hr>
          <p><small>result ( {{ result.ids.length }} / {{ result.hitCount }} )</small></p>
          <div v-for="id in result.ids">
            <div v-if="result['articles'][id]['source'] != 'PAT'" class="card">
              <div class="card-content">
                <div class="content">
                  <p>
                      <b>{{ result['articles'][id]['title'] }}</b> <br>
                      <small>
                        <span v-if="result['articles'][id]['journalInfo']">
                          {{ result['articles'][id]['journalInfo']['journal']['title'] }}, {{ result['articles'][id]['journalInfo']['printPublicationDate'] }} 
                        </span>
                        <span class="is-pulled-right">
                            <span v-if="result['articles'][id]['isOpenAccess'] == 'Y'">
                              <span class="tag is-info">Open Source</span>
                            </span>
                        </span>
                      </small>
                    </span>
                  </p>
                  <hr class="np">
                  {{ result['articles'][id]['abstractText'] }}
                  <span v-if="result['articles'][id]['chem']">
                    <hr class="np">
                    <span v-for="chem in result['articles'][id]['chem']">
                      <span class="tag is-light">{{ chem }}</span>&nbsp;
                    </span>
                  </span>
                </div>
              </div>
              <footer class="card-footer">
                <a v-if="result['articles'][id]['doi']" target="_blank" :href="'http://dx.doi.org/'+result['articles'][id]['doi']" class="card-footer-item">{{ result['articles'][id]['doi']}}</a>
                <a @click="saveArticle(id, result['articles'][id])" class="card-footer-item">+ Save Article </a>
              </footer>
            </div>
            <br>
          </div>
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
      options: [],
      searchTerms: ["DNA Gyrase B subunit", "gyrase B and inhibitors", "gyrase B and bioassay", "gyraseb and compounds"],
      result : {
        'hitCount' : 0,
        'ids': [],
        'articles': {}
      },
      sortedArticles : [],
      savedArticles: 0
    }
  },
  mounted: function(){
    this.getSavedArticles();
  },
  methods: {
    addTag(newTag) {
      this.options.push(newTag)
      this.value.push(newTag)
    },
    saveArticle(id, article){
      let articles = JSON.parse(localStorage.getItem("myArticles"))
      if(articles){
        if (!articles[id]){
          articles[id] = article
        }
        localStorage.setItem("myArticles", JSON.stringify(articles) )
      }else{
        let tempArticle = {}
        tempArticle[id] = article
        localStorage.setItem("myArticles", JSON.stringify(tempArticle) )
      }
      this.getSavedArticles();
    },
    searchEuropeanPMC() {
      this.result.hitCount = 0
      this.result.ids = []
      this.result.articles = {}

      this.searchTerms.forEach( term =>{
        let url = "https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=" + encodeURI(term) + "&format=json&pageSize=100&resulttype=core&synonym=true"
        axios.get(url)
        .then(response => {
          this.result['hitCount'] = this.result['hitCount'] + response.data.hitCount;
          response.data.resultList.result.forEach( result => {
            if (this.result.ids.indexOf(result.id) === -1  && result.source != "PAT"){
              this.result.ids.push(result.id);
              this.result.articles[result.id] = result;
              if(result['chemicalList']){
                this.result.articles[result.id]['chem'] = []
                result['chemicalList']['chemical'].forEach(chem=>{
                  this.result.articles[result.id]['chem'].push(chem.name)
                })
              }
              if(result['hasTextMinedTerms'] == 'Y'){
                axios.get("https://www.ebi.ac.uk/europepmc/webservices/rest/MED/"+result.id+"/textMinedTerms/CHEMICAL/json").then(response => {
                  if (response.data.semanticTypeList){
                    response.data.semanticTypeList.semanticType.forEach( semanticType => {
                      if(semanticType.name == 'chemical'){
                        semanticType.tmSummary.forEach(chem => {
                          if (!this.result.articles[result.id]['chem']){
                            this.result.articles[result.id]['chem'] = []
                          }
                          if (this.result.articles[result.id]['chem'].length == 0){
                            this.result.articles[result.id]['chem'] = []
                          }
                          this.result.articles[result.id]['chem'].push(chem.term)
                        })
                      }
                    })
                  }
                })
              }
            }
          });
          this.scoreAndSortArticles();
        })
        .catch(error => {
          console.log(error);
        });
      })
    },
    getSavedArticles(){
      this.savedArticles = Object.keys(JSON.parse(localStorage.getItem("myArticles"))).length
    },
    scoreAndSortArticles(){
      this.result.ids.forEach(id=>{
        this.calculateScore(this.result.articles[id])
      })
      this.sortedArticles.sort(function(a, b) {
        return b[1] - a[1];
      }); 
    },
    calculateScore(article){
      let score = 0
      score = score + article.citedByCount;
      if (parseInt(article.pubYear) > 2010){
        score = score + 10
      }
      if(article.chem){
        score = score + article.chem.length
      }
      article['score'] = score;
      this.sortedArticles.push([article.id, score])
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


.multiselect__tag {
    background: #2398EA;
}

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
