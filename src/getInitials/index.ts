/**
 * Get initial name
 * @param name string
 * @param no string
 * @returns 'Initial name'
 */
export const getInitials = (name: string, no = "?") => {
  if(!name || !name.trim()){
    return no;
  }
  
  let [first, last] = name.split(" ");

  let initial = first[0];

  if(first && last){
    initial += last[0];
  }
  
  return initial;
}
