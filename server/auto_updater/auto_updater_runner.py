from dataset_updater import (
    gather_new_papers,
    generate_vector_counts,
    merge_files,
    calculate_token_counts,
)

from embedding_bin_updater import (
    generate_centroid_dataset,
    generate_SAUCIE_coordinates,
    update_paper_bins_stats,
)

from gensim.models import Word2Vec

if __name__ == "__main__":
    # New temp paper files
    temp_dir_filename = "local_data/new_papers_added_dir.tsv"
    temp_embed_filename = "local_data/new_papers_embedding.tsv"
    temp_token_count_filename = "local_data/new_paper_token_count.tsv"

    # Current paper files
    current_pmc_dir_filename = "local_data/pmc_oa_file_list.tsv"
    paper_dataset_filename = "local_data/paper_dataset_full.tsv.xz"
    paper_landscape_file = "local_data/paper_dataset_tsne_square.tsv"
    centroid_dataset_filename = "local_data/centroid_dataset.tsv"

    # PC AXES
    pca_axes_file = "local_data/pca_components.tsv"

    # Word count Dicts
    global_word_counter_file = "local_data/global_doc_word_counter.tsv.xz"

    # Paper landscape
    paper_landscape_json_file = "local_data/pmc_square_plot.json"

    # Load the word model
    word_model = Word2Vec.load("../data/word2vec_model/biorxiv_300.model")

    # Run the pipeline
    # Gather new papers from pmc
    print("Gathering Papers....")
    gather_new_papers(
        current_pmc_dir_filename,
        word_model,
        temp_dir_filename,
        temp_embed_filename,
        temp_token_count_filename,
    )

    # Merging pmc listing
    print("Merging PMC Papers directory....")
    merge_files(current_pmc_dir_filename, temp_dir_filename)

    # Generate sauice coordinates for new papers
    # and bin them
    print("Gathering SAUCIE coordinates....")
    generate_SAUCIE_coordinates(
        temp_embed_filename, paper_landscape_file, paper_landscape_json_file
    )

    # Merge embeddings file
    print("Merging Embeddings File....")
    merge_files(paper_dataset_filename, temp_embed_filename)

    # Update centroid dataset
    print("Updating centroid dataset....")
    generate_centroid_dataset(paper_dataset_filename, centroid_dataset_filename)

    # merge global word counter file
    print("Merging Token Counts....")
    merge_files(global_word_counter_file, temp_token_count_filename)

    # Update the dictionaries
    print("Updating Token/Token bin Counts....")
    background_dict, word_bin_dict = calculate_token_counts(
        global_word_counter_file, paper_landscape_file
    )

    # Update landscape file
    print("Updating Paper Landscape....")
    update_paper_bins_stats(
        word_bin_dict,
        background_dict,
        paper_dataset_filename,
        pca_axes_file,
        paper_landscape_json_file,
    )
