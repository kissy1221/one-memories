require "csv"

class Api::V1::ExportsController < ApplicationController
  def show
    posts = Post.ordered

    case params[:type]
    when "csv"
      send_data build_csv(posts), filename: "one-memory.csv", type: "text/csv", disposition: "attachment"
    else
      send_data build_markdown(posts), filename: "one-memory.md", type: "text/markdown", disposition: "attachment"
    end
  end

  private

  def build_csv(posts)
    CSV.generate(headers: true) do |csv|
      csv << %w[posted_on content]
      posts.each { |p| csv << [p.posted_on.iso8601, p.content] }
    end
  end

  def build_markdown(posts)
    lines = ["# one memory\n"]
    posts.each do |p|
      lines << "## #{p.posted_on.iso8601}\n"
      lines << "#{p.content}\n"
    end
    lines.join("\n")
  end
end
