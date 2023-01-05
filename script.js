// it is a variable for finding a language which is the most frequent
var final_language = null

/* It is the main function. We get the ID and check if it is in the local storage ro not.
If it is not then we get the required info from fetching. After, we put the information in a suitable
position. by flexing, we can show the info to the user. After we get obj info, we insert it in our local
storage. Here we checked the error too. like if the user has not been signed up yet or any network error
like 403 for when we don't have VPN. If we have the ID in our local Storage, then we parse the information
and show the result to the user.
*/
async function mainFunction() {
    const id = document.getElementById("input").value;
    const newObject = window.localStorage.getItem(id);

    if (newObject == null) {

        document.getElementById("wrongUser").style.display = 'none'
        document.getElementById("error_label").style.display = 'none'
        document.getElementById("local_label").style.display = 'none'
        await setNone()

        const response = await fetch("https://api.github.com/users/" + id);
        if (response.status === 200) {

            document.getElementById("info").style.display = 'flex';

            const names = await response.json();

            const image = names.avatar_url;
            const name = names.name;
            const blog = names.blog;
            let bio = names.bio;
            const location = names.location;
            const pushed = pushing(names.repos_url)

            if((await pushed).length > 0)
                await frequentLanguage(await pushed)
            else
                final_language = null

            document.getElementById("image").src = image;
            document.getElementById("name_response").innerHTML = name;
            document.getElementById("blog_response").innerHTML = blog;
            document.getElementById("location_response").innerHTML = location;
            document.getElementById("language_response").innerHTML = await final_language;
            document.getElementById("bio_response").innerHTML = bio;


            if (name) {
                document.getElementById("name_label").style.display = 'flex';
                document.getElementById("name_response").style.display = 'flex';
            }

            if (blog) {
                document.getElementById("blog_label").style.display = 'flex';
                document.getElementById("blog_response").style.display = 'flex';
            }

            if (location) {
                document.getElementById("location_label").style.display = 'flex';
                document.getElementById("location_response").style.display = 'flex';
            }

            if (final_language) {
                document.getElementById("language_label").style.display = 'flex';
                document.getElementById("language_response").style.display = 'flex';
            }

            if (bio) {
                document.getElementById("bio_label").style.display = 'flex';
                document.getElementById("bio_response").style.display = 'flex';
            }

            const obj = {
                'avatar_url': names.avatar_url,
                'name': names.name,
                'blog': names.blog,
                'bio': names.bio,
                'location': names.location,
                'frequent_language': final_language
            };
            window.localStorage.setItem(id, JSON.stringify(obj));
        }

        else {
            document.getElementById("info").style.display = 'none';

            if (response.status === 404) {
                document.getElementById("wrongUser").style.display = 'flex';
                document.getElementById("wrongUser").innerHTML = 'User Not Found';
            }

            else {
                document.getElementById("error_label").style.display = 'flex';
                document.getElementById("error_label").innerHTML =  'Error ' + response.status;
            }
        }
    }

    else{

        document.getElementById("info").style.display = 'flex';
        document.getElementById("wrongUser").style.display = 'none'
        document.getElementById("error_label").style.display = 'none'
        document.getElementById("local_label").style.display = 'flex';
        document.getElementById("local_label").innerHTML = 'Retrieve from Local Storage';
        await setNone()

        document.getElementById("image").src = JSON.parse(newObject).avatar_url;
        document.getElementById("name_response").innerHTML = JSON.parse(newObject).name;
        document.getElementById("blog_response").innerHTML = JSON.parse(newObject).blog;
        document.getElementById("bio_response").innerHTML = JSON.parse(newObject).bio;
        document.getElementById("location_response").innerHTML = JSON.parse(newObject).location;
        document.getElementById("language_response").innerHTML = JSON.parse(newObject).frequent_language;


        if(JSON.parse(newObject).name){
            document.getElementById("name_label").style.display = 'flex';
            document.getElementById("name_response").style.display = 'flex';
        }

        if(JSON.parse(newObject).blog){
            document.getElementById("blog_label").style.display = 'flex';
            document.getElementById("blog_response").style.display = 'flex';
        }

        if(JSON.parse(newObject).location){
            document.getElementById("location_label").style.display = 'flex';
            document.getElementById("location_response").style.display = 'flex';
        }

        if(JSON.parse(newObject).frequent_language){
            document.getElementById("language_label").style.display = 'flex';
            document.getElementById("language_response").style.display = 'flex';
        }

        if(JSON.parse(newObject).bio){
          document.getElementById("bio_label").style.display = 'flex';
          document.getElementById("bio_response").style.display = 'flex'
        }
    }
}

/* Here we collect the type recent rep the user has pushed in a GitHub.
* We put the result of the date and a language of that rep to 'pushed'. The language is not null*/
async function pushing(repositories) {
    const response = await fetch(repositories);
    const names = await response.json();
    if (names.length > 0) {
        const pushed = [];
        for (let i = 0; i < names.length; i++) {
            if (names[i]['language'] != null) {
                const lan_date = [names[i]['pushed_at'], names[i]['language']];
                pushed.push(lan_date);
            }
        }

        if (pushed.length > 1) {
            pushed.sort();
            pushed.reverse();
        }
        return pushed
    }
    else
        return null
}

/* Here we determine the frequent language. If the number of language rep number is less than 5, we keep
 the whole. but if it is more, then we only keep the first five. we count the frequency of each language
 and the max one will set in 'final_language' We may have some most frequent. So we keep all the result
 in an array.*/
async function frequentLanguage(pushed){
    if(pushed.length === 0)
        return null

    let size = pushed.length;
    if(pushed.length > 5)
        size = 5

    const result = []
    let visited = Array.from({length: size}, (_, i) => false);
    for (let i = 0; i < size; i++) {

        if (visited[i] === true)
            continue;

        let count = 1;
        for (let j = i + 1; j < size; j++) {
            if (pushed[i][1] === pushed[j][1]) {
                visited[j] = true;
                count++;
            }
        }

        result.push(pushed[i][1]);
        result.push(count)
    }

    let max_frequency = result[1]
    let max_index = 1
    for (let i = 1 ; i < result.length ; i += 2){
        if (result[i] > max_frequency){
            max_frequency = result[i]
            max_index = i
        }
    }

    const languages = []
    for (let i = 1 ; i < result.length ; i += 2){
        if (result[i] === max_frequency){
            languages.push(result[i - 1])
        }
    }

    let final_result = "";
    for (let i = 0 ; i < languages.length ; i++)
        final_result = final_result.concat(languages[i], ", ")
    final_language = final_result.substring(0, final_result.length - 2)
}

async function setNone(){
    document.getElementById("name_label").style.display = 'none';
    document.getElementById("blog_label").style.display = 'none';
    document.getElementById("location_label").style.display = 'none';
    document.getElementById("language_label").style.display = 'none';
    document.getElementById("bio_label").style.display = 'none';
    document.getElementById("name_response").style.display = 'none';
    document.getElementById("blog_response").style.display = 'none';
    document.getElementById("location_response").style.display = 'none';
    document.getElementById("language_response").style.display = 'none';
    document.getElementById("bio_response").style.display = 'none';
}

